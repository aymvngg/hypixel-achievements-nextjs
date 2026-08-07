#!/usr/bin/env node
/**
 * Spam test for the per-IP / per-(IP, player) rate limiter on
 * /player/<player>/achievements.
 *
 * IMPORTANT NUANCE: the app serves player pages as server components, so a
 * rate-limit hit renders the friendly "Slow down!" panel with HTTP status 200
 * (a real 429 needs a route handler, which this app doesn't use for pages).
 * The script therefore detects rate limiting by scanning the response body
 * for the panel, in addition to reporting the raw HTTP status.
 *
 * Usage:
 *   node scripts/rate-limit-test.mjs [options]
 *
 * Examples:
 *   # 10 requests for the same player, then 25 distinct players
 *   node scripts/rate-limit-test.mjs
 *
 *   # only spam distinct players, fewer of them
 *   node scripts/rate-limit-test.mjs --same-count 0 --distinct-count 8
 *
 *   # hit the deployed site, simulating a single client IP
 *   node scripts/rate-limit-test.mjs --base https://aphunt.aymvn.net --ip 203.0.113.9
 *
 * Options:
 *   --base <url>          Base URL (default http://localhost:3000)
 *   --same <player>       Player for the same-player spam (default Hypixel)
 *   --same-count <n>      Requests for the same player (default 10; 0 skips)
 *   --distinct-count <n>  Distinct-player requests (default 25; 0 skips)
 *   --players <a,b,c>     Explicit player list (default: built-in list)
 *   --concurrency <n>     Parallel requests (default 5)
 *   --ip <addr>           Send X-Forwarded-For: <addr> to simulate a client IP
 *   --quiet               Only print the summary
 *   --help                Show this help
 *
 * Rate limiting only counts cache misses (cold upstream lookups). To make a
 * test trip the limiter quickly, run the dev server with low limits, e.g.:
 *   RATE_LIMIT_PER_IP_MAX=6 \
 *   RATE_LIMIT_DISTINCT_PLAYERS_PER_IP=3 \
 *   RATE_LIMIT_PLAYER_MAX=2 \
 *   bun run dev
 */

import { performance } from "node:perf_hooks";

const DEFAULT_BASE = "http://localhost:3000";
const DEFAULT_SAME = "Hypixel";

// Well-known accounts. Nonexistent names still exercise the limiter: the
// rate-limit gate runs before the name->UUID lookup.
const DEFAULT_PLAYERS = [
	"Hypixel",
	"Notch",
	"Technoblade",
	"Dream",
	"Ninja",
	"TommyInnit",
	"Tubbo",
	"WilburSoot",
	"Philza",
	"Quackity",
	"KarlJacobs",
	"GeorgeNotFound",
	"Sapnap",
	"Punz",
	"Hbomb94",
	"Skeppy",
	"BadBoyHalo",
	"CaptainSparklez",
	"DanTDM",
	"Jschlatt",
	"Fundy",
	"Ranboo",
	"Vikkstar123",
	"Purpled",
	"Antfrost",
];

const RATE_LIMIT_MARKERS = ["Slow down!", "making too many requests"];
const PAGE_ERROR_MARKERS = ["Couldn't load achievements", "No UUID found"];

function usage() {
	console.log(`Spam test for the per-IP / per-player rate limiter.

Usage:
  node scripts/rate-limit-test.mjs [options]

Options:
  --base <url>          Base URL (default ${DEFAULT_BASE})
  --same <player>       Player for the same-player spam (default ${DEFAULT_SAME})
  --same-count <n>      Requests for the same player (default 10; 0 skips)
  --distinct-count <n>  Distinct-player requests (default 25; 0 skips)
  --players <a,b,c>     Explicit player list (default: built-in list)
  --concurrency <n>     Parallel requests (default 5)
  --ip <addr>           Send X-Forwarded-For: <addr> to simulate a client IP
  --quiet               Only print the summary
  --help                Show this help

The app returns HTTP 200 with the "Slow down!" panel when rate-limited
(server-component pages don't emit a real 429); the script detects the panel
in the body and reports it as RATE LIMITED.

Tip: run the dev server with low limits to make it trip quickly:
  RATE_LIMIT_PER_IP_MAX=6 RATE_LIMIT_DISTINCT_PLAYERS_PER_IP=3 \\
  RATE_LIMIT_PLAYER_MAX=2 bun run dev`);
}

function parseArgs(argv) {
	const opts = {
		base: process.env.RATE_LIMIT_TEST_BASE ?? DEFAULT_BASE,
		same: DEFAULT_SAME,
		sameCount: 10,
		distinctCount: 25,
		players: [],
		concurrency: 5,
		ip: null,
		quiet: false,
	};
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		const next = () => {
			const v = argv[++i];
			if (v === undefined) throw new Error(`Missing value for ${a}`);
			return v;
		};
		switch (a) {
			case "--base": opts.base = next(); break;
			case "--same": opts.same = next(); break;
			case "--same-count": opts.sameCount = Number.parseInt(next(), 10); break;
			case "--distinct-count": opts.distinctCount = Number.parseInt(next(), 10); break;
			case "--players": opts.players = next().split(",").map((s) => s.trim()).filter(Boolean); break;
			case "--concurrency": opts.concurrency = Number.parseInt(next(), 10); break;
			case "--ip": opts.ip = next(); break;
			case "--quiet": opts.quiet = true; break;
			case "--help":
			case "-h":
				usage();
				process.exit(0);
			default:
				throw new Error(`Unknown option: ${a}`);
		}
	}
	if (!Number.isInteger(opts.sameCount) || opts.sameCount < 0) {
		throw new Error("--same-count must be a non-negative integer");
	}
	if (!Number.isInteger(opts.distinctCount) || opts.distinctCount < 0) {
		throw new Error("--distinct-count must be a non-negative integer");
	}
	if (!Number.isInteger(opts.concurrency) || opts.concurrency < 1) {
		throw new Error("--concurrency must be a positive integer");
	}
	if (opts.sameCount === 0 && opts.distinctCount === 0) {
		throw new Error("Nothing to do: set --same-count and/or --distinct-count to a value > 0");
	}
	return opts;
}

async function runPool(jobs, opts) {
	const rows = new Array(jobs.length);
	let next = 0;
	const workers = Array.from(
		{ length: Math.min(opts.concurrency, jobs.length) },
		async () => {
			while (next < jobs.length) {
				const i = next++;
				rows[i] = await hit(jobs[i], i, opts);
				if (!opts.quiet) {
					const r = rows[i];
					const tag = r.limited
						? "RATE LIMITED"
						: r.error
							? `ERROR`
							: r.pageError
								? "page error"
								: "ok";
					console.log(
						`[${String(i + 1).padStart(4)}] ${String(r.player).padEnd(18)} ${String(r.status).padStart(3)} ${String(r.ms).padStart(6)}ms  ${tag}`,
					);
				}
			}
		},
	);
	await Promise.all(workers);
	return rows;
}

async function hit(player, index, opts) {
	const url = `${opts.base.replace(/\/$/, "")}/player/${encodeURIComponent(player)}/achievements`;
	const headers = {};
	if (opts.ip) headers["x-forwarded-for"] = opts.ip;

	const start = performance.now();
	try {
		const res = await fetch(url, { headers, redirect: "follow" });
		const ms = Math.round(performance.now() - start);
		const body = await res.text();
		const limited =
			res.status === 429 ||
			RATE_LIMIT_MARKERS.some((m) => body.includes(m));
		const pageError = PAGE_ERROR_MARKERS.some((m) => body.includes(m));
		return { player, status: res.status, ms, limited, pageError, size: body.length };
	} catch (err) {
		return {
			player,
			status: 0,
			ms: Math.round(performance.now() - start),
			error: err.cause?.code ?? err.message,
			limited: false,
			pageError: false,
		};
	}
}

function statusHistogram(rows) {
	const hist = {};
	for (const r of rows) {
		hist[r.status] = (hist[r.status] ?? 0) + 1;
	}
	return Object.entries(hist)
		.map(([s, n]) => `${s}:${n}`)
		.join(", ");
}

function printSummary(phase, rows) {
	const limited = rows.filter((r) => r.limited);
	const errors = rows.filter((r) => r.error);
	const firstLimited = rows.find((r) => r.limited);
	console.log(`  total:          ${rows.length}`);
	console.log(`  statuses:       ${statusHistogram(rows) || "n/a"}`);
	console.log(`  rate limited:   ${limited.length}`);
	if (firstLimited) {
		console.log(
			`  first limited:  request #${rows.indexOf(firstLimited) + 1} (${firstLimited.player})`,
		);
	}
	console.log(`  network errors: ${errors.length}`);
	console.log(`  unique players: ${new Set(rows.map((r) => r.player.toLowerCase())).size}`);
	if (limited.length === 0) {
		console.log("  -> no rate limiting triggered in this phase");
	}
}

async function main() {
	let opts;
	try {
		opts = parseArgs(process.argv.slice(2));
	} catch (err) {
		console.error(`error: ${err.message}`);
		usage();
		process.exit(1);
	}

	console.log(
		`Base: ${opts.base}  Concurrency: ${opts.concurrency}  Simulated IP: ${opts.ip ?? "(none -> 'unknown' key)"}`,
	);

	let all = [];
	let networkErrors = 0;

	if (opts.sameCount > 0) {
		console.log(
			`\n== Same-player phase: /player/${opts.same}/achievements x${opts.sameCount} ==`,
		);
		const jobs = Array.from({ length: opts.sameCount }, () => opts.same);
		const rows = await runPool(jobs, opts);
		all = all.concat(rows);
		console.log("-- same-player summary --");
		printSummary("same", rows);
	}

	if (opts.distinctCount > 0) {
		const pool = opts.players.length ? opts.players : DEFAULT_PLAYERS;
		const jobs = Array.from(
			{ length: opts.distinctCount },
			(_, i) => pool[i % pool.length],
		);
		console.log(
			`\n== Distinct-player phase: ${opts.distinctCount} requests over ${new Set(pool.map((p) => p.toLowerCase())).size} unique player name(s) ==`,
		);
		const rows = await runPool(jobs, opts);
		all = all.concat(rows);
		console.log("-- distinct-player summary --");
		printSummary("distinct", rows);
	}

	networkErrors = all.filter((r) => r.error).length;

	console.log("\n== Overall ==");
	printSummary("overall", all);

	if (networkErrors > 0) {
		console.error(
			`\n${networkErrors} request(s) failed to connect — is the server running at ${opts.base}?`,
		);
		process.exit(1);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
