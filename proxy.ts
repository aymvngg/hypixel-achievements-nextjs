import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CLIENT_IP_HEADER } from "@/lib/ratelimit/ip";
import { getRateLimitBackend } from "@/lib/ratelimit/check";
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

// --- Rate-limit gate --------------------------------------------------------

async function enforceRateLimit(ip: string, playerKey: string): Promise<number | null> {
	const result = await getRateLimitBackend().guard({
		ip,
		playerKey,
		// Matches the loader cacheLife revalidate (5 min for players). Requests
		// served from the shared cache don't burn budget.
		cacheWindowMs: 300_000,
	});
	if (result.ok) return null;
	return result.retryAfterSec;
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

export async function proxy(request: NextRequest) {
	const ip = resolveClientIp(request);
	const pathname = request.nextUrl.pathname;

	// Enforce the per-IP / per-(IP, player) budgets before the page renders.
	// Only meaningful for player routes; everything else just gets the IP
	// header injected.
	const playerKey = playerKeyFromPath(pathname);
	if (playerKey !== null && ip) {
		const retryAfterSec = await enforceRateLimit(ip, playerKey);
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
