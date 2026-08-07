#!/usr/bin/env node
/**
 * Capture fixture data for demo mode (DEMO_MODE=true).
 *
 * Fetches the achievements catalog, quests catalog, and a sample player from
 * the live Hypixel API and writes them as JSON into the `demo/` directory so
 * the app can render every page without touching the API.
 *
 * Usage:
 *   node scripts/capture-demo.mjs <username>
 *
 * Examples:
 *   node scripts/capture-demo.mjs Hypixel
 *
 * Reads HYPIXEL_API_KEY from the shell environment or from a .env file in the
 * project root (loaded automatically).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const demoDir = join(root, "demo");
const HYPIXEL_BASE = "https://api.hypixel.net/v2";

async function loadDotEnv() {
	let text;
	try {
		text = await readFile(join(root, ".env"), "utf8");
	} catch {
		return;
	}
	for (const line of text.split("\n")) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const eq = trimmed.indexOf("=");
		if (eq === -1) continue;
		const key = trimmed.slice(0, eq).trim();
		let value = trimmed.slice(eq + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		if (process.env[key] === undefined) process.env[key] = value;
	}
}

await loadDotEnv();

const username = process.argv[2];
const apiKey = process.env.HYPIXEL_API_KEY;

if (!username) {
	console.error("Usage: node scripts/capture-demo.mjs <username>");
	process.exit(1);
}
if (!apiKey) {
	console.error(
		"HYPIXEL_API_KEY env var is required. Set it before running this script.",
	);
	process.exit(1);
}

async function hypixel(path) {
	const res = await fetch(`${HYPIXEL_BASE}${path}`, {
		headers: { "API-Key": apiKey },
	});
	const text = await res.text();
	if (!res.ok) {
		throw new Error(`Hypixel ${path} -> ${res.status}: ${text}`);
	}
	return JSON.parse(text);
}

async function main() {
	await mkdir(demoDir, { recursive: true });

	console.log(`Resolving UUID for "${username}" via Mojang...`);
	const mojangRes = await fetch(
		`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`,
	);
	const mojang = await mojangRes.json();
	if (!mojang?.id) {
		throw new Error(`No UUID found for player "${username}"`);
	}
	const uuid = mojang.id;
	console.log(`  -> ${uuid}`);

	console.log("Fetching achievements catalog...");
	const achievements = await hypixel("/resources/achievements");
	await writeFile(
		join(demoDir, "achievements.json"),
		JSON.stringify(achievements, null, "\t"),
	);

	console.log("Fetching quests catalog...");
	const quests = await hypixel("/resources/quests");
	await writeFile(
		join(demoDir, "quests.json"),
		JSON.stringify(quests, null, "\t"),
	);

	console.log(`Fetching player ${uuid}...`);
	const player = await hypixel(`/player?uuid=${uuid}`);
	await writeFile(
		join(demoDir, "player.json"),
		JSON.stringify(player, null, "\t"),
	);

	console.log(`\nDone. Fixtures written to ${demoDir}`);
	console.log("Start the app with DEMO_MODE=true to use them.");
}

main().catch((err) => {
	console.error(err?.message ?? err);
	process.exit(1);
});
