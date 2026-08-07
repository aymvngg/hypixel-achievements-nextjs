import "server-only";

import Redis from "ioredis";
import { getRateLimitConfig } from "@/lib/ratelimit/config";
import type { RateLimitBackend, RateLimitResult } from "@/lib/ratelimit/backend";
import { InMemoryRateLimitBackend } from "@/lib/ratelimit/backend";
import { RedisRateLimitBackend } from "@/lib/ratelimit/redis-backend";

export class RateLimitError extends Error {
	constructor(
		message: string,
		readonly retryAfterSec: number,
	) {
		super(message);
		this.name = "RateLimitError";
	}
}

export function isRateLimitError(err: unknown): err is RateLimitError {
	return err instanceof RateLimitError;
}

const REDIS_RETRY_MS = 5000;

let redisClient: Redis | null = null;
let redisAttemptAt = 0;
let fallback: InMemoryRateLimitBackend | null = null;

/**
 * Shared backend used by both the data-layer gate and the Proxy. When Redis is
 * reachable the Redis backend is used (one shared state across instances);
 * otherwise we fall back to a per-process in-memory backend.
 *
 * The in-memory fallback instance is cached so budget state persists across
 * requests while Redis is unavailable.
 */
function getBackend(): RateLimitBackend {
	const budget = getRateLimitConfig();
	if (!fallback) fallback = new InMemoryRateLimitBackend(budget);

	const url = process.env.REDIS_URL;
	if (url) {
		const now = Date.now();
		if (redisClient?.status === "ready") {
			return new RedisRateLimitBackend(budget, redisClient, fallback);
		}
		if (now - redisAttemptAt >= REDIS_RETRY_MS) {
			redisAttemptAt = now;
			try {
				if (!redisClient) {
					redisClient = new Redis(url, {
						maxRetriesPerRequest: 1,
						connectTimeout: 1500,
						lazyConnect: true,
						retryStrategy: (times) => Math.min(50 + times * 100, 2000),
						enableOfflineQueue: false,
					});
					redisClient.on("error", () => {});
					redisClient.connect().catch(() => {});
				}
			} catch {
				// Fall through to the in-memory fallback.
			}
		}
		if (redisClient?.status === "ready") {
			return new RedisRateLimitBackend(budget, redisClient, fallback);
		}
	}

	return fallback;
}

/** For tests: reset the cached backend state. */
export function __resetBackend(): void {
	redisClient = null;
	redisAttemptAt = 0;
	fallback = null;
}

/** Shared backend used by both the data-layer gate and the Proxy. */
export function getRateLimitBackend(): RateLimitBackend {
	return getBackend();
}

/**
 * Cache-aware gate. Called before an upstream call from the public fetchers.
 *
 * - If the same lookup was recently approved (cache still warm), do nothing —
 *   the loader will serve from cache and no budget is consumed.
 * - Otherwise consume the per-IP and per-(IP, player) budgets, then record the
 *   approval. Throws RateLimitError when a budget is exhausted.
 */
export async function guardUpstream(options: {
	ip: string;
	playerKey: string;
	/** How long the underlying cache keeps the entry warm (ms). */
	cacheWindowMs: number;
}): Promise<void> {
	const result = await getBackend().guard(options);
	if (!result.ok) {
		throw new RateLimitError(rateLimitMessage(result.kind), result.retryAfterSec);
	}
}

export async function assertRateLimit(
	ip: string,
	playerKey: string,
): Promise<void> {
	await guardUpstream({ ip, playerKey, cacheWindowMs: 0 });
}

function rateLimitMessage(kind: RateLimitResult["kind"]): string {
	switch (kind) {
		case "player":
			return "Too many requests for this player. Please try again in a bit.";
		case "distinct":
			return "You've looked up too many different players. Please slow down.";
		default:
			return "Too many requests from your IP. Please slow down and try again.";
	}
}
