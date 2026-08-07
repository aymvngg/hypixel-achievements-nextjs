import "server-only";

import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { Achievements } from "hypixel-api-reborn";
import { collectLegacyAchievementKeys } from "@/lib/hypixel/achievement-legacy";
import type { RawAchievementsResponse } from "@/lib/hypixel/achievement-legacy";
import type { RawQuestsResponse } from "@/lib/hypixel/correlate-quests";
import type {
	AchievementCatalog,
	RawCountsResponse,
	RawPlayerResponse,
} from "@/lib/hypixel/api";

const DEMO_DIR = join(process.cwd(), "demo");

const fixtureCache = new Map<string, { mtime: number; data: unknown }>();

function readFixture<T>(name: string): T {
	const file = join(DEMO_DIR, name);
	let mtime: number;
	try {
		mtime = statSync(file).mtimeMs;
	} catch {
		throw new Error(
			`[demo] Missing fixture "${name}". Run \`node scripts/capture-demo.mjs <username>\` to generate it.`,
		);
	}

	const cached = fixtureCache.get(file);
	if (cached && cached.mtime === mtime) {
		return cached.data as T;
	}

	const data = JSON.parse(readFileSync(file, "utf8")) as T;
	fixtureCache.set(file, { mtime, data });
	return data;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const AchievementsCtor = require("hypixel-api-reborn/src/structures/Static/Achievements");

export function loadDemoAchievementCatalog(): AchievementCatalog {
	const raw = readFixture<RawAchievementsResponse>("achievements.json");
	const achievements = new AchievementsCtor(raw) as Achievements;
	const legacyKeys = collectLegacyAchievementKeys(raw);
	return { achievements, legacyKeys };
}

export function loadDemoPlayerRaw(): RawPlayerResponse {
	return readFixture<RawPlayerResponse>("player.json");
}

export function loadDemoQuests(): RawQuestsResponse {
	return readFixture<RawQuestsResponse>("quests.json");
}

export function loadDemoCounts(): RawCountsResponse {
	return readFixture<RawCountsResponse>("counts.json");
}
