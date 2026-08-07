import "server-only";

import { getRateLimitConfig } from "@/lib/ratelimit/config";
import { SlidingWindowLimiter } from "@/lib/ratelimit/limiter";

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

/**
 * Per-process singleton limiters. In-memory only; state resets on restart,
 * which is acceptable for the single-instance deployment.
 */
function getLimiters() {
	const cfg = getRateLimitConfig();
	return {
		perIp: new SlidingWindowLimiter(cfg.perIpWindowMs, cfg.perIpMax),
		perPlayer: new SlidingWindowLimiter(
			cfg.perPlayerWindowMs,
			cfg.perPlayerMax,
		),
		distinctPlayers: new SlidingWindowLimiter(
			cfg.perPlayerWindowMs,
			cfg.distinctPlayersPerIpMax,
		),
	};
}

// Module-level singletons, created once and reused across requests.
const limiters = getLimiters();

/**
 * Tracks which lookups were recently approved to actually hit the upstream
 * API. The upstream cache is shared across all IPs, so a player that was
 * fetched moments ago is served from cache for everyone. Requests served from
 * cache must not consume rate-limit budget.
 */
class ApprovedTracker {
	private readonly map = new Map<string, number>();

	/**
	 * True when the last upstream fetch for `key` happened within `windowMs`.
	 * In that case the loader cache is still warm and this request will be a
	 * cache hit, so it should not count against any budget.
	 */
	isRecentlyApproved(key: string, windowMs: number, now = Date.now()): boolean {
		const last = this.map.get(key);
		if (last === undefined) return false;
		if (now - last >= windowMs) {
			this.map.delete(key);
			return false;
		}
		return true;
	}

	markApproved(key: string, now = Date.now()): void {
		this.map.set(key, now);
	}

	clear(): void {
		this.map.clear();
	}
}

const approved = new ApprovedTracker();

/**
 * Cache-aware gate. Called before an upstream call from the public fetchers.
 *
 * - If the same lookup was recently approved (cache still warm), do nothing —
 *   the loader will serve from cache and no budget is consumed.
 * - Otherwise consume the per-IP and per-(IP, player) budgets, then record the
 *   approval. Throws RateLimitError when a budget is exhausted.
 */
export function guardUpstream(options: {
	ip: string;
	playerKey: string;
	/** How long the underlying cache keeps the entry warm (ms). */
	cacheWindowMs: number;
}): void {
	const { ip, playerKey, cacheWindowMs } = options;
	if (getRateLimitConfig().disabled) return;
	if (approved.isRecentlyApproved(playerKey, cacheWindowMs)) return;

	assertRateLimit(ip, playerKey);
	approved.markApproved(playerKey);
}

export function assertRateLimit(ip: string, playerKey: string): void {
	const cfg = getRateLimitConfig();
	if (cfg.disabled) return;

	const perIp = limiters.perIp.consume(`ip:${ip}`);
	if (!perIp.ok) {
		throw new RateLimitError(
			"Too many requests from your IP. Please slow down and try again.",
			perIp.retryAfterSec,
		);
	}

	const perPlayer = limiters.perPlayer.consume(`${ip}:${playerKey}`);
	if (!perPlayer.ok) {
		throw new RateLimitError(
			`Too many requests for this player. Please try again in a bit.`,
			perPlayer.retryAfterSec,
		);
	}

	const distinct = limiters.distinctPlayers.consume(`distinct:${ip}`);
	if (!distinct.ok) {
		throw new RateLimitError(
			"You've looked up too many different players. Please slow down.",
			distinct.retryAfterSec,
		);
	}
}
