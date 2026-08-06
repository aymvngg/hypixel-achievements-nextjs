const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const CACHE_DIR = path.join(process.cwd(), "lib", ".cache", "next-cache");
const TAGS_INDEX_FILE = path.join(CACHE_DIR, "_tags.json");
const pendingSets = new Map();
let dirEnsured = false;
/** Serializes tag-index reads/writes to avoid corrupting _tags.json. */
let tagsIndexLock = Promise.resolve();

function cacheFilePath(cacheKey) {
	const hash = crypto.createHash("sha256").update(cacheKey).digest("hex");
	return path.join(CACHE_DIR, `${hash}.json`);
}

function cacheFileName(cacheKey) {
	return `${crypto.createHash("sha256").update(cacheKey).digest("hex")}.json`;
}

async function ensureDir() {
	if (dirEnsured) return;
	await fs.mkdir(CACHE_DIR, { recursive: true });
	dirEnsured = true;
}

function asTagsIndex(value) {
	if (
		value !== null &&
		typeof value === "object" &&
		!Array.isArray(value)
	) {
		return value;
	}
	return {};
}

function normalizeTags(tags) {
	if (!Array.isArray(tags)) return [];
	return tags.filter((tag) => typeof tag === "string");
}

function finiteNumber(value, fallback) {
	const n = Number(value);
	return Number.isFinite(n) ? n : fallback;
}

async function withTagsIndexLock(operation) {
	const run = tagsIndexLock.then(operation);
	tagsIndexLock = run.catch(() => {});
	return run;
}

async function readTagsIndex() {
	try {
		const raw = await fs.readFile(TAGS_INDEX_FILE, "utf8");
		return asTagsIndex(JSON.parse(raw));
	} catch {
		return {};
	}
}

async function writeTagsIndex(index) {
	await ensureDir();
	await fs.writeFile(
		TAGS_INDEX_FILE,
		JSON.stringify(asTagsIndex(index)),
		"utf8",
	);
}

async function setTagsForFile(fileName, tags) {
	const normalizedTags = normalizeTags(tags);
	if (normalizedTags.length === 0) return;

	await withTagsIndexLock(async () => {
		const index = await readTagsIndex();
		for (const tagList of Object.values(index)) {
			if (!Array.isArray(tagList)) continue;
			const idx = tagList.indexOf(fileName);
			if (idx !== -1) tagList.splice(idx, 1);
		}
		for (const tag of normalizedTags) {
			if (!index[tag]) index[tag] = [];
			if (!index[tag].includes(fileName)) index[tag].push(fileName);
		}
		await writeTagsIndex(index);
	});
}

async function rebuildTagsIndex() {
	const index = {};
	let files;
	try {
		files = await fs.readdir(CACHE_DIR);
	} catch {
		return index;
	}

	await Promise.all(
		files.map(async (file) => {
			if (!file.endsWith(".json") || file === "_tags.json") return;
			try {
				const raw = await fs.readFile(
					path.join(CACHE_DIR, file),
					"utf8",
				);
				const data = JSON.parse(raw);
				const tags = normalizeTags(data.tags);
				for (const tag of tags) {
					if (!index[tag]) index[tag] = [];
					if (!index[tag].includes(file)) index[tag].push(file);
				}
			} catch {
				// Ignore unreadable cache files while rebuilding the tag index.
			}
		}),
	);

	await writeTagsIndex(index);
	return index;
}

async function readStream(stream) {
	if (!stream || typeof stream.getReader !== "function") {
		throw new TypeError("Cache entry value must be a ReadableStream");
	}

	const reader = stream.getReader();
	const chunks = [];
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			if (value === undefined || value === null) continue;
			chunks.push(Buffer.from(value));
		}
	} finally {
		reader.releaseLock();
	}
	return Buffer.concat(chunks);
}

function bufferToStream(buffer) {
	return new ReadableStream({
		start(controller) {
			controller.enqueue(new Uint8Array(buffer));
			controller.close();
		},
	});
}

function isExpired(entry) {
	const now = Date.now();
	const timestamp = finiteNumber(entry.timestamp, NaN);
	const revalidate = finiteNumber(entry.revalidate, NaN);
	const expire = finiteNumber(entry.expire, NaN);

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

function normalizeCacheEntry(entry) {
	const timestamp = finiteNumber(entry.timestamp, Date.now());
	const revalidate = finiteNumber(entry.revalidate, 1);
	const expire = finiteNumber(entry.expire, 0);
	const stale = finiteNumber(entry.stale, 0);
	const value = entry.value;

	if (typeof value !== "string" || value.length === 0) {
		throw new TypeError("Cache entry value is missing or invalid");
	}

	return {
		value: bufferToStream(Buffer.from(value, "base64")),
		tags: normalizeTags(entry.tags),
		stale,
		timestamp,
		expire,
		revalidate,
	};
}

function sanitizeEntryForDisk(entry) {
	if (!entry || typeof entry !== "object") {
		throw new TypeError("Cache entry is missing");
	}

	if (
		!entry.value ||
		typeof entry.value.getReader !== "function"
	) {
		throw new TypeError("Cache entry value must be a ReadableStream");
	}

	return {
		tags: normalizeTags(entry.tags),
		stale: finiteNumber(entry.stale, 0),
		timestamp: finiteNumber(entry.timestamp, Date.now()),
		expire: finiteNumber(entry.expire, 0),
		revalidate: finiteNumber(entry.revalidate, 1),
	};
}

/** @type {import('next/dist/server/lib/cache-handlers/types').CacheHandler} */
module.exports = {
	async get(cacheKey, _softTags) {
		const pendingPromise = pendingSets.get(cacheKey);
		if (pendingPromise) {
			await pendingPromise;
		}

		try {
			const raw = await fs.readFile(cacheFilePath(cacheKey), "utf8");
			const data = JSON.parse(raw);
			if (isExpired(data)) {
				return undefined;
			}

			return normalizeCacheEntry(data);
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
			await ensureDir();
			const entry = await pendingEntry;
			const meta = sanitizeEntryForDisk(entry);
			const buffer = await readStream(entry.value);
			const fileName = cacheFileName(cacheKey);

			await fs.writeFile(
				cacheFilePath(cacheKey),
				JSON.stringify({
					value: buffer.toString("base64"),
					tags: meta.tags,
					stale: meta.stale,
					timestamp: meta.timestamp,
					expire: meta.expire,
					revalidate: meta.revalidate,
				}),
				"utf8",
			);

			await setTagsForFile(fileName, meta.tags);
		} catch (err) {
			console.warn(
				`Warning: failed to write Next.js cache entry (${err instanceof Error ? err.message : String(err)})`,
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

		try {
			await ensureDir();
			await withTagsIndexLock(async () => {
				let index = await readTagsIndex();
				const hasIndexedTags = tags.some(
					(tag) =>
						Array.isArray(index[tag]) && index[tag].length > 0,
				);
				if (!hasIndexedTags) {
					index = await rebuildTagsIndex();
				}

				const filesToDelete = new Set();
				for (const tag of tags) {
					const fileList = index[tag];
					if (!Array.isArray(fileList)) continue;
					for (const file of fileList) filesToDelete.add(file);
				}

				await Promise.all(
					[...filesToDelete].map(async (file) => {
						try {
							await fs.unlink(path.join(CACHE_DIR, file));
						} catch {
							// Ignore missing cache files during tag invalidation.
						}
					}),
				);

				for (const file of filesToDelete) {
					for (const [tag, fileList] of Object.entries(index)) {
						if (!Array.isArray(fileList)) continue;
						const next = fileList.filter((entry) => entry !== file);
						if (next.length === 0) delete index[tag];
						else index[tag] = next;
					}
				}

				await writeTagsIndex(index);
			});
		} catch {
			// Ignore missing cache directory during tag invalidation.
		}
	},
};
