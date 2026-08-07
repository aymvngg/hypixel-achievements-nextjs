import { describe, it, expect, beforeEach, vi } from "vitest";

// Module singletons (limiters + approved tracker) live at import time, so we
// reset the module between tests to get a clean slate.
async function freshCheck() {
	vi.resetModules();
	const mod = await import("@/lib/ratelimit/check");
	mod.__resetBackend();
	return mod;
}

function setEnv(overrides: Record<string, string | undefined>) {
	for (const [k, v] of Object.entries(overrides)) {
		if (v === undefined) delete process.env[k];
		else process.env[k] = v;
	}
}

describe("guardUpstream (cache-aware gate)", () => {
	beforeEach(() => {
		setEnv({
			REDIS_URL: undefined,
			RATE_LIMIT_PER_IP_MAX: "10",
			RATE_LIMIT_PER_IP_WINDOW_MS: "60000",
			RATE_LIMIT_PLAYER_MAX: "2",
			RATE_LIMIT_PLAYER_WINDOW_MS: "60000",
			RATE_LIMIT_DISTINCT_PLAYERS_PER_IP: "2",
			RATE_LIMIT_DISABLED: undefined,
		});
	});

	it("enforces the per-(IP, player) budget on cold lookups", async () => {
		const { guardUpstream } = await freshCheck();
		// cacheWindowMs: 0 forces every call to be treated as a cold upstream
		// miss, so each consumes the per-(IP, player) budget (2 allowed).
		await expect(
			guardUpstream({ ip: "1.2.3.4", playerKey: "alice", cacheWindowMs: 0 }),
		).resolves.toBeUndefined();
		await expect(
			guardUpstream({ ip: "1.2.3.4", playerKey: "alice", cacheWindowMs: 0 }),
		).resolves.toBeUndefined();

		// Third cold lookup exceeds the per-(IP, player) budget.
		await expect(
			guardUpstream({ ip: "1.2.3.4", playerKey: "alice", cacheWindowMs: 0 }),
		).rejects.toThrow(/too many requests for this player/i);
	});

	it("allows cache-warm requests without counting against per-IP budget", async () => {
		const { guardUpstream } = await freshCheck();
		// Cold: first request consumes per-IP budget.
		await expect(
			guardUpstream({ ip: "9.9.9.9", playerKey: "bob", cacheWindowMs: 300_000 }),
		).resolves.toBeUndefined();
		// Cache-warm repeat: no new budget consumed, allowed.
		await expect(
			guardUpstream({ ip: "9.9.9.9", playerKey: "bob", cacheWindowMs: 300_000 }),
		).resolves.toBeUndefined();
		// Now a *different* player cold lookup consumes the 2nd per-IP slot.
		await expect(
			guardUpstream({ ip: "9.9.9.9", playerKey: "carol", cacheWindowMs: 300_000 }),
		).resolves.toBeUndefined();
		// A 3rd distinct player cold lookup exceeds the distinct-per-IP limit.
		await expect(
			guardUpstream({ ip: "9.9.9.9", playerKey: "dave", cacheWindowMs: 300_000 }),
		).rejects.toThrow(/different players/i);
	});

	it("tracks distinct players per IP", async () => {
		const { guardUpstream } = await freshCheck();
		await expect(
			guardUpstream({ ip: "8.8.8.8", playerKey: "p1", cacheWindowMs: 300_000 }),
		).resolves.toBeUndefined();
		await expect(
			guardUpstream({ ip: "8.8.8.8", playerKey: "p2", cacheWindowMs: 300_000 }),
		).resolves.toBeUndefined();
		// 3rd distinct player exceeds the 2-per-IP distinct limit.
		await expect(
			guardUpstream({ ip: "8.8.8.8", playerKey: "p3", cacheWindowMs: 300_000 }),
		).rejects.toThrow(/different players/i);
	});

	it("respects the disabled kill-switch", async () => {
		setEnv({ RATE_LIMIT_DISABLED: "true" });
		const { guardUpstream } = await freshCheck();
		await expect(
			guardUpstream({ ip: "7.7.7.7", playerKey: "zed", cacheWindowMs: 300_000 }),
		).resolves.toBeUndefined();
	});
});
