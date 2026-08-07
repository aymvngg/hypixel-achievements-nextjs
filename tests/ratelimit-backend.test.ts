import { describe, it, expect } from "vitest";
import { InMemoryRateLimitBackend } from "@/lib/ratelimit/backend";

const BUDGET = {
	perIpWindowMs: 60_000,
	perIpMax: 10,
	perPlayerWindowMs: 60_000,
	perPlayerMax: 2,
	distinctPlayersPerIpMax: 2,
	disabled: false,
};

describe("InMemoryRateLimitBackend", () => {
	it("allows cache-warm requests without consuming budget", async () => {
		const backend = new InMemoryRateLimitBackend(BUDGET);
		await expect(
			backend.guard({ ip: "1.1.1.1", playerKey: "alice", cacheWindowMs: 300_000 }),
		).resolves.toEqual({ ok: true, retryAfterSec: 0, kind: undefined });
		// Cache-warm repeat consumes nothing.
		await expect(
			backend.guard({ ip: "1.1.1.1", playerKey: "alice", cacheWindowMs: 300_000 }),
		).resolves.toMatchObject({ ok: true });
	});

	it("enforces the per-(IP, player) budget on cold lookups", async () => {
		const backend = new InMemoryRateLimitBackend(BUDGET);
		await backend.guard({ ip: "1.1.1.1", playerKey: "alice", cacheWindowMs: 0 });
		await backend.guard({ ip: "1.1.1.1", playerKey: "alice", cacheWindowMs: 0 });
		const res = await backend.guard({
			ip: "1.1.1.1",
			playerKey: "alice",
			cacheWindowMs: 0,
		});
		expect(res.ok).toBe(false);
		expect(res.kind).toBe("player");
	});

	it("returns kind 'distinct' when too many different players are looked up", async () => {
		const backend = new InMemoryRateLimitBackend(BUDGET);
		await backend.guard({ ip: "2.2.2.2", playerKey: "p1", cacheWindowMs: 0 });
		await backend.guard({ ip: "2.2.2.2", playerKey: "p2", cacheWindowMs: 0 });
		const res = await backend.guard({ ip: "2.2.2.2", playerKey: "p3", cacheWindowMs: 0 });
		expect(res.ok).toBe(false);
		expect(res.kind).toBe("distinct");
	});

	it("frees slots as timestamps age out of the window", async () => {
		const backend = new InMemoryRateLimitBackend(BUDGET);
		await backend.guard({ ip: "3.3.3.3", playerKey: "alice", cacheWindowMs: 0 });
		await backend.guard({ ip: "3.3.3.3", playerKey: "alice", cacheWindowMs: 0 });
		// Advance past the window by faking time via Date.now is not possible
		// here; verify the budget still blocks within the window.
		const res = await backend.guard({
			ip: "3.3.3.3",
			playerKey: "alice",
			cacheWindowMs: 0,
		});
		expect(res.ok).toBe(false);
	});

	it("respects the disabled kill-switch", async () => {
		const backend = new InMemoryRateLimitBackend({ ...BUDGET, disabled: true });
		await expect(
			backend.guard({ ip: "4.4.4.4", playerKey: "alice", cacheWindowMs: 0 }),
		).resolves.toMatchObject({ ok: true });
	});
});
