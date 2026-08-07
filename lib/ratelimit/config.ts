import "server-only";

export interface RateLimitConfig {
	/** Sliding window for the per-IP cap, in milliseconds. */
	perIpWindowMs: number;
	/** Max upstream calls per IP per window. */
	perIpMax: number;
	/** Sliding window for the per-(IP, player) cap, in milliseconds. */
	perPlayerWindowMs: number;
	/** Max upstream calls per (IP, player) per window. */
	perPlayerMax: number;
	/** Max distinct players per IP per window. */
	distinctPlayersPerIpMax: number;
	/** Master kill-switch; when true no limits are enforced. */
	disabled: boolean;
}

const intFromEnv = (name: string, fallback: number): number => {
	const raw = process.env[name];
	if (raw === undefined || raw === "") return fallback;
	const parsed = Number(raw);
	if (!Number.isInteger(parsed) || parsed < 1) {
		throw new Error(`${name} must be a positive integer, got "${raw}"`);
	}
	return parsed;
};

const boolFromEnv = (name: string, fallback: boolean): boolean => {
	const raw = process.env[name];
	if (raw === undefined || raw === "") return fallback;
	return raw === "1" || raw.toLowerCase() === "true";
};

let cached: RateLimitConfig | null = null;

export function getRateLimitConfig(): RateLimitConfig {
	if (cached) return cached;
	cached = {
		perIpWindowMs: intFromEnv("RATE_LIMIT_PER_IP_WINDOW_MS", 60_000),
		perIpMax: intFromEnv("RATE_LIMIT_PER_IP_MAX", 60),
		perPlayerWindowMs: intFromEnv(
			"RATE_LIMIT_PLAYER_WINDOW_MS",
			3_600_000,
		),
		perPlayerMax: intFromEnv("RATE_LIMIT_PLAYER_MAX", 15),
		distinctPlayersPerIpMax: intFromEnv(
			"RATE_LIMIT_DISTINCT_PLAYERS_PER_IP",
			20,
		),
		disabled: boolFromEnv("RATE_LIMIT_DISABLED", false),
	};
	return cached;
}
