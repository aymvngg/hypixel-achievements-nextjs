/**
 * Request header that proxy.ts sets with the real client IP (read from
 * CF-Connecting-IP / X-Real-IP / rightmost X-Forwarded-For entry, in that
 * order — Cloudflare and Traefik are in front of the app). Pages read it via
 * headers() to pass into the rate-limit gate.
 */
export const CLIENT_IP_HEADER = "x-client-ip";
