import "server-only";

import Redis from "ioredis";
import type {
	RateLimitBackend,
	RateLimitBudget,
	RateLimitResult,
} from "@/lib/ratelimit/backend";
import { InMemoryRateLimitBackend } from "@/lib/ratelimit/backend";

const KEY_PREFIX = "rl:";
const APPROVED_PREFIX = "rl:approved:";

/**
 * Atomic cache-aware gate. Runs in one Redis round-trip so Proxy stays fast.
 *
 * Returns a single result: [ok, retryAfterSec]. Keys:
 *   rl:ip:<ip>                        sliding window of request timestamps
 *   rl:player:<ip>:<playerKey>        sliding window of request timestamps
 *   rl:distinct:<ip>                  sliding window of timestamps per player
 *   rl:approved:<playerKey>           last approved upstream fetch timestamp
 */
const GATE_LUA = `
local approvedKey = KEYS[4]
local cacheWindowMs = tonumber(ARGV[6])
local now = tonumber(ARGV[1])

if cacheWindowMs > 0 then
  local approvedAt = redis.call('GET', approvedKey)
  if approvedAt and now - tonumber(approvedAt) < cacheWindowMs then
    return { 1, 0, '' }
  end
end

local function consume(key, windowMs, max, member, kind)
  local cutoff = now - windowMs
  redis.call('ZREMRANGEBYSCORE', key, '-inf', cutoff)
  local count = redis.call('ZCARD', key)
  if count >= max then
    local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
    local oldestScore = now
    if #oldest > 1 then
      oldestScore = tonumber(oldest[2])
    end
    local retryMs = oldestScore + windowMs - now + 1
    if retryMs < 1 then retryMs = 1 end
    return { 0, math.ceil(retryMs / 1000), kind }
  end
  redis.call('ZADD', key, now, member)
  redis.call('PEXPIRE', key, windowMs)
  return { 1, 0, '' }
end

local perIp = consume(KEYS[1], tonumber(ARGV[2]), tonumber(ARGV[3]), now .. ':' .. math.random(), 'ip')
if perIp[1] == 0 then return perIp end

local perPlayer = consume(KEYS[2], tonumber(ARGV[4]), tonumber(ARGV[5]), now .. ':' .. math.random(), 'player')
if perPlayer[1] == 0 then return perPlayer end

local distinct = consume(KEYS[3], tonumber(ARGV[4]), tonumber(ARGV[7]), now .. ':' .. math.random(), 'distinct')
if distinct[1] == 0 then return distinct end

if cacheWindowMs > 0 then
  redis.call('SET', approvedKey, now, 'PX', cacheWindowMs)
end
return { 1, 0, '' }
`;

export class RedisRateLimitBackend implements RateLimitBackend {
	private readonly client: Redis;
	private readonly budget: RateLimitBudget;
	private readonly fallback: InMemoryRateLimitBackend;

	constructor(
		budget: RateLimitBudget,
		client: Redis,
		fallback: InMemoryRateLimitBackend,
	) {
		this.budget = budget;
		this.client = client;
		this.fallback = fallback;
	}

	async guard(options: {
		ip: string;
		playerKey: string;
		cacheWindowMs: number;
	}): Promise<RateLimitResult> {
		try {
			const budget = this.budget;
			const res = (await this.client.eval(
				GATE_LUA,
				4,
				`${KEY_PREFIX}ip:${options.ip}`,
				`${KEY_PREFIX}player:${options.ip}:${options.playerKey}`,
				`${KEY_PREFIX}distinct:${options.ip}`,
				`${APPROVED_PREFIX}${options.playerKey}`,
				String(Date.now()),
				String(budget.perIpWindowMs),
				String(budget.perIpMax),
				String(budget.perPlayerWindowMs),
				String(budget.perPlayerMax),
				String(options.cacheWindowMs),
				String(budget.distinctPlayersPerIpMax),
			)) as [number, number, string];
			return {
				ok: res[0] === 1,
				retryAfterSec: res[1] ?? 0,
				kind: res[2] as "ip" | "player" | "distinct" | undefined,
			};
		} catch {
			// Fail-open: if Redis is unavailable, degrade to per-instance limits.
			return this.fallback.guard(options);
		}
	}
}
