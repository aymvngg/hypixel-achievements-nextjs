export interface ConsumeResult {
	ok: boolean;
	/** Seconds until the key may be consumed again (0 when allowed). */
	retryAfterSec: number;
}

/**
 * In-memory sliding-window rate limiter.
 *
 * State lives in a module-level Map so it survives across requests within the
 * long-running server process. It resets on restart, which is acceptable for
 * the current single-instance deployment.
 */
export class SlidingWindowLimiter {
	private readonly buckets = new Map<string, number[]>();

	constructor(
		private readonly windowMs: number,
		private readonly max: number,
	) {}

	private prune(key: string, now: number): number[] {
		const timestamps = this.buckets.get(key);
		if (!timestamps) return [];
		const cutoff = now - this.windowMs;
		const kept = timestamps.filter((t) => t > cutoff);
		if (kept.length === 0) this.buckets.delete(key);
		else this.buckets.set(key, kept);
		return kept;
	}

	consume(key: string, now = Date.now()): ConsumeResult {
		const timestamps = this.prune(key, now);
		if (timestamps.length >= this.max) {
			// The oldest timestamp in the window determines when a slot frees up.
			const oldest = timestamps[0];
			const retryAfterMs = oldest + this.windowMs - now + 1;
			return {
				ok: false,
				retryAfterSec: Math.ceil(retryAfterMs / 1000),
			};
		}
		timestamps.push(now);
		this.buckets.set(key, timestamps);
		return { ok: true, retryAfterSec: 0 };
	}

	get size(): number {
		return this.buckets.size;
	}

	clear(): void {
		this.buckets.clear();
	}
}
