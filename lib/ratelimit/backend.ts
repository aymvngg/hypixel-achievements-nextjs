import "server-only";

export interface RateLimitResult {
	ok: boolean;
	/** Seconds until the key may be consumed again (0 when allowed). */
	retryAfterSec: number;
	/** Which budget was exceeded (when not ok). */
	kind?: "ip" | "player" | "distinct";
}

/**
 * Storage abstraction for rate-limit budgets and cache-warm approvals.
 *
 * The Redis implementation backs this so Proxy (which returns real 429s) and
 * the data-layer gate share exactly one state. When Redis is unavailable the
 * in-memory implementation is used as a fail-open fallback.
 */
export interface RateLimitBackend {
	/**
	 * Cache-aware upstream gate. If the same lookup was recently approved the
	 * underlying loader cache is still warm, so nothing is consumed. Otherwise
	 * consume the per-IP, per-(IP, player) and distinct-player budgets.
	 */
	guard(options: {
		ip: string;
		playerKey: string;
		cacheWindowMs: number;
	}): Promise<RateLimitResult>;
}

/** Fixed budgets shared by both backends. */
export interface RateLimitBudget {
	perIpWindowMs: number;
	perIpMax: number;
	perPlayerWindowMs: number;
	perPlayerMax: number;
	distinctPlayersPerIpMax: number;
	disabled: boolean;
}

/** In-memory sliding-window bucket. */
class WindowBucket {
	private readonly buckets = new Map<string, number[]>();

	consume(
		key: string,
		windowMs: number,
		max: number,
		now: number,
	): RateLimitResult {
		const cutoff = now - windowMs;
		const kept = (this.buckets.get(key) ?? []).filter((t) => t > cutoff);
		if (kept.length >= max) {
			const oldest = kept[0];
			return {
				ok: false,
				retryAfterSec: Math.ceil((oldest + windowMs - now + 1) / 1000),
			};
		}
		kept.push(now);
		this.buckets.set(key, kept);
		return { ok: true, retryAfterSec: 0 };
	}

	clear(): void {
		this.buckets.clear();
	}
}

/**
 * Tracks which lookups were recently approved to actually hit the upstream
 * API. The upstream cache is shared across all IPs, so a player fetched moments
 * ago is served from cache for everyone and must not consume budget.
 */
class ApprovedTracker {
	private readonly map = new Map<string, number>();

	isRecentlyApproved(key: string, windowMs: number, now: number): boolean {
		const last = this.map.get(key);
		if (last === undefined) return false;
		if (now - last >= windowMs) {
			this.map.delete(key);
			return false;
		}
		return true;
	}

	markApproved(key: string, now: number): void {
		this.map.set(key, now);
	}

	clear(): void {
		this.map.clear();
	}
}

/**
 * Per-process in-memory backend. State resets on restart; used as the default
 * (and as the fail-open fallback when Redis is down).
 */
export class InMemoryRateLimitBackend implements RateLimitBackend {
	private readonly perIp = new WindowBucket();
	private readonly perPlayer = new WindowBucket();
	private readonly distinct = new WindowBucket();
	private readonly approved = new ApprovedTracker();

	constructor(private readonly budget: RateLimitBudget) {}

	async guard(options: {
		ip: string;
		playerKey: string;
		cacheWindowMs: number;
	}): Promise<RateLimitResult> {
		if (this.budget.disabled) return { ok: true, retryAfterSec: 0 };

		const now = Date.now();
		const { ip, playerKey, cacheWindowMs } = options;

		if (this.approved.isRecentlyApproved(playerKey, cacheWindowMs, now)) {
			return { ok: true, retryAfterSec: 0 };
		}

		const perIp = this.perIp.consume(
			`ip:${ip}`,
			this.budget.perIpWindowMs,
			this.budget.perIpMax,
			now,
		);
		if (!perIp.ok) return { ...perIp, kind: "ip" };

		const perPlayer = this.perPlayer.consume(
			`${ip}:${playerKey}`,
			this.budget.perPlayerWindowMs,
			this.budget.perPlayerMax,
			now,
		);
		if (!perPlayer.ok) return { ...perPlayer, kind: "player" };

		const distinct = this.distinct.consume(
			`distinct:${ip}`,
			this.budget.perPlayerWindowMs,
			this.budget.distinctPlayersPerIpMax,
			now,
		);
		if (!distinct.ok) return { ...distinct, kind: "distinct" };

		this.approved.markApproved(playerKey, now);
		return { ok: true, retryAfterSec: 0 };
	}

	get size(): number {
		return 0;
	}

	clear(): void {
		this.perIp.clear();
		this.perPlayer.clear();
		this.distinct.clear();
		this.approved.clear();
	}
}
