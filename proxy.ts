import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CLIENT_IP_HEADER } from "@/lib/ratelimit/ip";
import { rateLimitPage } from "@/lib/ratelimit/rate-limit-page";

// ---------------------------------------------------------------------------
// Rate limiting in Proxy.
//
// Next.js 16 runs Proxy in the same Node process as the app when self-hosted,
// so module-level state persists across requests. This is where the per-IP and
// per-(IP, player) budgets are enforced, because only Proxy can return a real
// HTTP 429 before the page renders (server-component pages always answer 200).
//
// The data layer (lib/ratelimit/*) enforces the same budgets as a second layer
// for any internal calls that bypass the Proxy path.
//
// Deployment is Cloudflare -> Traefik -> this app:
// - CF-Connecting-IP is overwritten by Cloudflare with the true visitor IP and
//   is the most trustworthy source.
// - X-Real-IP is set by Traefik from the connection peer.
// - X-Forwarded-For is appended-to by each proxy; the rightmost entry is the
//   one added by the nearest hop (Traefik). Earlier entries are client
//   spoofable, so never trust the first entry.
// ---------------------------------------------------------------------------

/** Best-effort: strip an IPv4-mapped IPv6 prefix and IPv6 zone IDs. */
function normalizeIp(raw: string): string {
	const trimmed = raw.trim();
	if (!trimmed) return "";
	// "2001:db8::1%eth0" -> "2001:db8::1"
	const noZone = trimmed.replace(/%[0-9a-zA-Z.-]+$/, "");
	// "::ffff:192.0.2.1" -> "192.0.2.1"
	return noZone.replace(/^::ffff:/, "");
}

function resolveClientIp(request: NextRequest): string {
	const cf = request.headers.get("cf-connecting-ip");
	const realIp = request.headers.get("x-real-ip");
	const forwarded = request.headers.get("x-forwarded-for");
	const raw = cf ?? realIp ?? (forwarded ? forwarded.split(",").at(-1) : "");
	return normalizeIp(raw ?? "");
}

// --- Sliding-window limiter (self-contained; no external deps) -------------

interface SlidingWindowLimiter {
	consume(key: string, now?: number): { ok: boolean; retryAfterSec: number };
}

function createLimiter(windowMs: number, max: number): SlidingWindowLimiter {
	const buckets = new Map<string, number[]>();
	return {
		consume(key: string, now = Date.now()) {
			const cutoff = now - windowMs;
			const kept = (buckets.get(key) ?? []).filter((t) => t > cutoff);
			if (kept.length >= max) {
				return {
					ok: false,
					retryAfterSec: Math.ceil((kept[0] + windowMs - now + 1) / 1000),
				};
			}
			kept.push(now);
			buckets.set(key, kept);
			return { ok: true, retryAfterSec: 0 };
		},
	};
}

// --- Env-driven limits ------------------------------------------------------

function intFromEnv(name: string, fallback: number): number {
	const raw = process.env[name];
	if (raw === undefined || raw === "") return fallback;
	const parsed = Number(raw);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function boolFromEnv(name: string, fallback: boolean): boolean {
	const raw = process.env[name];
	if (raw === undefined || raw === "") return fallback;
	return raw === "1" || raw.toLowerCase() === "true";
}

const PER_IP_WINDOW_MS = intFromEnv("RATE_LIMIT_PER_IP_WINDOW_MS", 60_000);
const PER_IP_MAX = intFromEnv("RATE_LIMIT_PER_IP_MAX", 120);
const PER_PLAYER_WINDOW_MS = intFromEnv(
	"RATE_LIMIT_PLAYER_WINDOW_MS",
	3_600_000,
);
const PER_PLAYER_MAX = intFromEnv("RATE_LIMIT_PLAYER_MAX", 60);
const DISTINCT_PLAYERS_MAX = intFromEnv(
	"RATE_LIMIT_DISTINCT_PLAYERS_PER_IP",
	120,
);
const DISABLED = boolFromEnv("RATE_LIMIT_DISABLED", false);

// Module-level singletons; state persists for the lifetime of the process.
const perIpLimiter = createLimiter(PER_IP_WINDOW_MS, PER_IP_MAX);
const perPlayerLimiter = createLimiter(PER_PLAYER_WINDOW_MS, PER_PLAYER_MAX);
const distinctPlayersLimiter = createLimiter(
	PER_PLAYER_WINDOW_MS,
	DISTINCT_PLAYERS_MAX,
);

// Tracks which player lookups were recently approved to hit upstream, so
// requests served from the shared cache don't burn budget.
const approvedLookups = new Map<string, number>();

function enforceRateLimit(ip: string, playerKey: string): number | null {
	if (DISABLED) return null;

	const now = Date.now();

	// Cache-aware: if this player was fetched moments ago, the loader cache is
	// still warm and this request will be served from cache without an upstream
	// call, so it shouldn't consume budget.
	const approvedAt = approvedLookups.get(playerKey);
	const cacheWindowMs = 300_000; // matches hypixelPlayer cacheLife revalidate
	if (approvedAt !== undefined && now - approvedAt < cacheWindowMs) {
		return null;
	}

	const perIp = perIpLimiter.consume(`ip:${ip}`, now);
	if (!perIp.ok) return perIp.retryAfterSec;

	const perPlayer = perPlayerLimiter.consume(`${ip}:${playerKey}`, now);
	if (!perPlayer.ok) return perPlayer.retryAfterSec;

	const distinct = distinctPlayersLimiter.consume(`distinct:${ip}`, now);
	if (!distinct.ok) return distinct.retryAfterSec;

	approvedLookups.set(playerKey, now);
	return null;
}

// --- Player URL parsing -----------------------------------------------------

/** Matches /player/<username>/achievements (also /quests, /breakdown). */
const PLAYER_ROUTE_RE = /^\/player\/([^/?#]+)(?:\/(achievements|quests|breakdown))?/;

function playerKeyFromPath(pathname: string): string | null {
	const match = PLAYER_ROUTE_RE.exec(pathname);
	if (!match) return null;
	return decodeURIComponent(match[1]).toLowerCase();
}

// --- Proxy ------------------------------------------------------------------

export function proxy(request: NextRequest) {
	const ip = resolveClientIp(request);
	const pathname = request.nextUrl.pathname;

	// Enforce the per-IP / per-(IP, player) budgets before the page renders.
	// Only meaningful for player routes; everything else just gets the IP
	// header injected.
	const playerKey = playerKeyFromPath(pathname);
	if (playerKey !== null && ip) {
		const retryAfterSec = enforceRateLimit(ip, playerKey);
		if (retryAfterSec !== null) {
			return new NextResponse(rateLimitPage(retryAfterSec), {
				status: 429,
				headers: {
					"content-type": "text/html; charset=utf-8",
					"retry-after": String(retryAfterSec),
				},
			});
		}
	}

	// Always inject the client IP for the data-layer gate.
	const response = NextResponse.next();
	if (ip) response.headers.set(CLIENT_IP_HEADER, ip);
	return response;
}

export const config = {
	// Apply to every route; cheap and stateless. Excluding static assets
	// would risk missing RSC data requests for the same page.
	matcher: "/:path*",
};
