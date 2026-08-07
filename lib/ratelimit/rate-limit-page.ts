/**
 * HTML for the HTTP 429 page, rendered as a plain string. Route handlers in
 * Next 16 cannot import react-dom/server, and app-router pages always return
 * 200, so the Proxy returns this body directly with a real 429 status. The
 * markup mirrors the site's Minecraft aesthetic (colors from globals.css).
 */

const STYLES = `
	body { margin: 0; background: #2d2d2d; color: #e8e8e8; font-family: monospace, "Courier New", ui-monospace, sans-serif; }
	.wrap { min-height: 100dvh; display: flex; flex-direction: column; }
	header { border-bottom: 3px solid #1a1a1a; background: #3c3c3c; box-shadow: 0 4px 0 rgba(0,0,0,0.28); }
	header > div { max-width: 72rem; margin: 0 auto; padding: 0.75rem 1rem; }
	.logo { color: #ffaa00; font-weight: bold; font-size: 1.125rem; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; }
	.sub { display: block; color: #7a7a7a; font-size: 0.75rem; margin-top: 0.25rem; }
	main { flex: 1; width: 100%; max-width: 72rem; margin: 0 auto; padding: 1.5rem 1rem; box-sizing: border-box; display: flex; justify-content: center; }
	.panel { max-width: 36rem; width: 100%; border: 3px solid #1a1a1a; background: #4a4a4a; box-shadow: 4px 4px 0 rgba(0,0,0,0.35); padding: 2.5rem 1.5rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
	.icon { width: 3.5rem; height: 3.5rem; border: 3px solid #1a1a1a; background: rgba(170,51,51,0.2); box-shadow: inset 2px 2px 3px rgba(0,0,0,0.4); border-radius: 2px; display: flex; align-items: center; justify-content: center; }
	.icon svg { width: 2rem; height: 2rem; stroke: #aa3333; fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
	.title { color: #aa3333; font-size: 1.125rem; text-transform: uppercase; letter-spacing: 0.06em; margin: 0; }
	.msg { color: #e8e8e8; opacity: 0.9; font-size: 0.875rem; line-height: 1.6; margin: 0; }
	.home { display: inline-block; border: 3px solid #1a1a1a; background: #aa3333; color: #fff; text-transform: uppercase; letter-spacing: 0.02em; padding: 0.5rem 1rem; font-size: 0.875rem; text-decoration: none; box-shadow: inset 2px 2px 0 rgba(255,255,255,0.12), inset -2px -2px 0 rgba(0,0,0,0.3), 3px 3px 0 rgba(0,0,0,0.35); }
	.home:hover { filter: brightness(1.1); }
	.retry { color: #7a7a7a; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
`;

function waitText(retryAfterSec: number): string {
	if (retryAfterSec <= 0) return "Please wait a moment before trying again.";
	const minutes = Math.max(1, Math.ceil(retryAfterSec / 60));
	return `Please wait about ${minutes} minute${
		minutes === 1 ? "" : "s"
	} before trying again.`;
}

export function rateLimitPage(retryAfterSec: number): string {
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Slow down! - Hypixel Achievements</title>
<style>${STYLES}</style>
</head>
<body>
	<div class="wrap">
		<header>
			<div>
				<a class="logo" href="/">Hypixel Achievements<span class="sub">Browse, compare, and break down player achievements.</span></a>
			</div>
		</header>
		<main>
			<div class="panel">
				<div class="icon" aria-hidden="true">
					<svg viewBox="0 0 24 24"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/></svg>
				</div>
				<h1 class="title">Slow down!</h1>
				<p class="msg">You&apos;re making too many requests. ${waitText(retryAfterSec)}</p>
				<a class="home" href="/">Back to Home</a>
				<span class="retry">You can retry in ${retryAfterSec}s</span>
			</div>
		</main>
	</div>
</body>
</html>`;
}
