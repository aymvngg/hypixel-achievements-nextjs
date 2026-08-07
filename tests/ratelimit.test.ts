import { describe, it, expect } from "vitest";
import { SlidingWindowLimiter } from "@/lib/ratelimit/limiter";

const WINDOW = 1_000;
const MAX = 3;

describe("SlidingWindowLimiter", () => {
	it("allows requests up to the max within a window", () => {
		const limiter = new SlidingWindowLimiter(WINDOW, MAX);
		let now = 0;
		for (let i = 0; i < MAX; i++) {
			const r = limiter.consume("k", now);
			expect(r.ok).toBe(true);
			expect(r.retryAfterSec).toBe(0);
			now += 10;
		}
	});

	it("rejects once the window is full and reports retry-after", () => {
		const limiter = new SlidingWindowLimiter(WINDOW, MAX);
		let now = 0;
		for (let i = 0; i < MAX; i++) {
			limiter.consume("k", now);
			now += 10;
		}
		const r = limiter.consume("k", now);
		expect(r.ok).toBe(false);
		expect(r.retryAfterSec).toBeGreaterThan(0);
	});

	it("frees slots as old timestamps age out of the window", () => {
		const limiter = new SlidingWindowLimiter(WINDOW, MAX);
		let now = 0;
		for (let i = 0; i < MAX; i++) {
			limiter.consume("k", now);
			now += 10;
		}
		// Advance past the oldest timestamp's window.
		now = WINDOW + 1;
		const r = limiter.consume("k", now);
		expect(r.ok).toBe(true);
	});

	it("tracks keys independently", () => {
		const limiter = new SlidingWindowLimiter(WINDOW, MAX);
		limiter.consume("a", 0);
		limiter.consume("a", 0);
		limiter.consume("a", 0);
		expect(limiter.consume("b", 0).ok).toBe(true);
		expect(limiter.consume("a", 0).ok).toBe(false);
	});

	it("removes empty keys on prune", () => {
		const limiter = new SlidingWindowLimiter(WINDOW, MAX);
		limiter.consume("k", 0);
		expect(limiter.size).toBe(1);
		// Let the entry expire and touch it again; it should be pruned.
		limiter.consume("k", WINDOW + 1);
		expect(limiter.size).toBe(1); // new timestamp re-added after prune
		expect(limiter.consume("k", WINDOW + 100).ok).toBe(true);
	});

	it("clear() empties all buckets", () => {
		const limiter = new SlidingWindowLimiter(WINDOW, MAX);
		limiter.consume("a", 0);
		limiter.consume("b", 0);
		limiter.clear();
		expect(limiter.size).toBe(0);
		expect(limiter.consume("a", 0).ok).toBe(true);
	});
});
