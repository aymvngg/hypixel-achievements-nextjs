const { Redis } = require("ioredis");

const KEY_PREFIX = "nx:";
const BACKOFF_MS = 5000;
const CONNECT_TIMEOUT_MS = 1500;
const pendingSets = new Map();

let client = null;
let connecting = null;
let lastAttemptAt = 0;

function getRedisUrl() {
	return process.env.REDIS_URL ?? "redis://localhost:6379";
}

function makeClient() {
	const redis = new Redis(getRedisUrl(), {
		maxRetriesPerRequest: 1,
		connectTimeout: CONNECT_TIMEOUT_MS,
		lazyConnect: true,
		retryStrategy: (times) => Math.min(50 + times * 100, 2000),
		enableOfflineQueue: false,
	});
	redis.on("error", (err) => {
		if (process.env.NEXT_PRIVATE_DEBUG_CACHE) {
			console.warn("Redis error", err);
		}
	});
	return redis;
}

/**
 * Best-effort readiness probe. Never blocks for longer than CONNECT_TIMEOUT_MS,
 * and backs off after a failed attempt so Redis downtime doesn't stall renders.
 */
async function isReady() {
	if (client && client.status === "ready") return true;

	if (connecting) return connecting;

	const now = Date.now();
	if (now - lastAttemptAt < BACKOFF_MS) return false;
	lastAttemptAt = now;

	const redis = makeClient();
	connecting = new Promise((resolve) => {
		Promise.race([
			redis.connect(),
			new Promise((res) => setTimeout(res, CONNECT_TIMEOUT_MS)),
		]).then(
			() => {
				if (redis.status === "ready") client = redis;
				resolve(redis.status === "ready");
			},
			() => {
				resolve(false);
			},
		).finally(() => {
			connecting = null;
			if (redis.status !== "ready") {
				redis.disconnect();
			}
		});
	});

	return await connecting;
}

function redisKey(cacheKey) {
	return `${KEY_PREFIX}${cacheKey}`;
}

function finiteNumber(value, fallback) {
	const n = Number(value);
	return Number.isFinite(n) ? n : fallback;
}

/** Serialize a cache entry into a Redis-storable string. Exported for tests. */
function serializeEntry(entry) {
	return new Promise((resolve, reject) => {
		const reader = entry.value.getReader();
		const chunks = [];
		const pump = () => {
			reader.read().then(
				({ done, value }) => {
					if (done) {
						reader.releaseLock();
						const buffer = Buffer.concat(chunks);
						resolve(
							JSON.stringify({
								value: buffer.toString("base64"),
								tags: Array.isArray(entry.tags) ? entry.tags : [],
								stale: finiteNumber(entry.stale, 0),
								timestamp: finiteNumber(entry.timestamp, Date.now()),
								expire: finiteNumber(entry.expire, 0),
								revalidate: finiteNumber(entry.revalidate, 1),
							}),
						);
						return;
					}
					if (value !== undefined && value !== null) {
						chunks.push(Buffer.from(value));
					}
					pump();
				},
				(err) => {
					reader.releaseLock();
					reject(err);
				},
			);
		};
		pump();
	});
}

/** Rebuild a CacheEntry from a stored JSON string. Exported for tests. */
function deserializeEntry(raw) {
	const data = JSON.parse(raw);
	if (typeof data.value !== "string" || data.value.length === 0) {
		throw new TypeError("Cache entry value is missing or invalid");
	}
	const buffer = Buffer.from(data.value, "base64");
	return {
		value: new ReadableStream({
			start(controller) {
				controller.enqueue(new Uint8Array(buffer));
				controller.close();
			},
		}),
		tags: Array.isArray(data.tags) ? data.tags : [],
		stale: finiteNumber(data.stale, 0),
		timestamp: finiteNumber(data.timestamp, Date.now()),
		expire: finiteNumber(data.expire, 0),
		revalidate: finiteNumber(data.revalidate, 1),
	};
}

function isExpired(data) {
	const now = Date.now();
	const timestamp = finiteNumber(data.timestamp, NaN);
	const revalidate = finiteNumber(data.revalidate, NaN);
	const expire = finiteNumber(data.expire, NaN);
	if (!Number.isFinite(timestamp)) return true;
	if (!Number.isFinite(revalidate) || revalidate <= 0) return true;
	if (now > timestamp + revalidate * 1000) return true;
	if (
		Number.isFinite(expire) &&
		expire > 0 &&
		now > timestamp + expire * 1000
	) {
		return true;
	}
	return false;
}

/** @type {import('next/dist/server/lib/cache-handlers/types').CacheHandler} */
module.exports = {
	async get(cacheKey, _softTags) {
		const pendingPromise = pendingSets.get(cacheKey);
		if (pendingPromise) {
			await pendingPromise;
		}

		if (!(await isReady())) {
			return undefined;
		}

		try {
			const raw = await client.get(redisKey(cacheKey));
			if (raw === null || raw === undefined) {
				return undefined;
			}
			const data = JSON.parse(raw);
			if (isExpired(data)) {
				return undefined;
			}
			return deserializeEntry(raw);
		} catch {
			return undefined;
		}
	},

	async set(cacheKey, pendingEntry) {
		let resolvePending = () => {};
		const pendingPromise = new Promise((resolve) => {
			resolvePending = resolve;
		});
		pendingSets.set(cacheKey, pendingPromise);

		try {
			if (!(await isReady())) {
				return;
			}
			const entry = await pendingEntry;
			const raw = await serializeEntry(entry);
			const ttl = Math.max(
				1,
				finiteNumber(entry.expire, finiteNumber(entry.revalidate, 1)),
			);
			await client.set(redisKey(cacheKey), raw, "EX", ttl);
		} catch (err) {
			console.warn(
				`Warning: failed to write Redis cache entry (${err instanceof Error ? err.message : String(err)})`,
			);
		} finally {
			resolvePending();
			pendingSets.delete(cacheKey);
		}
	},

	async refreshTags() {},

	async getExpiration(tags) {
		if (!Array.isArray(tags)) return 0;
		return 0;
	},

	async updateTags(tags, _durations) {
		if (!Array.isArray(tags) || tags.length === 0) return;
	},

	serializeEntry,
	deserializeEntry,
};
