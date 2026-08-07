import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import Redis from "ioredis";
import { RedisRateLimitBackend } from "@/lib/ratelimit/redis-backend";
import { InMemoryRateLimitBackend } from "@/lib/ratelimit/backend";

const REDIS_URL = process.env.REDIS_URL;
const describeMaybe = REDIS_URL ? describe : describe.skip;

const BUDGET = {
	perIpWindowMs: 60_000,
	perIpMax: 120,
	perPlayerWindowMs: 3_600_000,
	perPlayerMax: 60,
	distinctPlayersPerIpMax: 2,
	disabled: false,
};

describeMaybe("RedisRateLimitBackend", () => {
	let client: Redis;
	let backend: RedisRateLimitBackend;
	let fallback: InMemoryRateLimitBackend;

	beforeAll(async () => {
		client = new Redis(REDIS_URL!);
		await Promise.resolve();
		fallback = new InMemoryRateLimitBackend(BUDGET);
		backend = new RedisRateLimitBackend(BUDGET, client, fallback);
	});

	beforeEach(async () => {
		const keys = await client.keys("rl:*");
		if (keys.length) await client.del(...keys);
	});

	afterAll(async () => {
		await client.quit();
	});

	it("allows cache-warm requests without consuming budget", async () => {
		await backend.guard({ ip: "1.1.1.1", playerKey: "alice", cacheWindowMs: 300_000 });
		const res = await backend.guard({ ip: "1.1.1.1", playerKey: "alice", cacheWindowMs: 300_000 });
		expect(res.ok).toBe(true);
	});

	it("enforces the distinct-player budget", async () => {
		await backend.guard({ ip: "2.2.2.2", playerKey: "p1", cacheWindowMs: 0 });
		await backend.guard({ ip: "2.2.2.2", playerKey: "p2", cacheWindowMs: 0 });
		const res = await backend.guard({ ip: "2.2.2.2", playerKey: "p3", cacheWindowMs: 0 });
		expect(res.ok).toBe(false);
		expect(res.kind).toBe("distinct");
		expect(res.retryAfterSec).toBeGreaterThan(0);
	});

	it("enforces the per-(IP, player) budget", async () => {
		const budget = { ...BUDGET, perPlayerMax: 1 };
		const b = new RedisRateLimitBackend(budget, client, fallback);
		await b.guard({ ip: "3.3.3.3", playerKey: "alice", cacheWindowMs: 0 });
		const res = await b.guard({ ip: "3.3.3.3", playerKey: "alice", cacheWindowMs: 0 });
		expect(res.ok).toBe(false);
		expect(res.kind).toBe("player");
	});

	it("falls back to in-memory when Redis fails", async () => {
		const badClient = new Redis("redis://localhost:1", {
			maxRetriesPerRequest: 1,
			connectTimeout: 200,
			lazyConnect: true,
			enableOfflineQueue: false,
		});
		const b = new RedisRateLimitBackend(BUDGET, badClient, fallback);
		const res = await b.guard({ ip: "4.4.4.4", playerKey: "alice", cacheWindowMs: 0 });
		expect(res.ok).toBe(true);
		badClient.disconnect();
	});
});
