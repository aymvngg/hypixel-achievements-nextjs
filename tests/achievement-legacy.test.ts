import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import type { Achievements } from "hypixel-api-reborn";
import type { PlayerData } from "@/lib/hypixel/types";
import { collectLegacyAchievementKeys } from "@/lib/hypixel/achievement-legacy";
import { correlateAchievements } from "@/lib/hypixel/correlate";

const rawAchievements = JSON.parse(
	readFileSync(new URL("../ach-res.json", import.meta.url), "utf8"),
);

describe("collectLegacyAchievementKeys", () => {
	it("collects legacy one-time and tiered achievement keys", () => {
		const keys = collectLegacyAchievementKeys(rawAchievements);

		expect(keys.has("arcade_PTB_RIDE_BAT")).toBe(true);
		expect(keys.has("bedwars_LOOT_BOX")).toBe(true);
		expect(keys.has("christmas2017_ADVENT_2024")).toBe(true);
		expect(keys.has("arcade_CREEPER_ATTACK_SURVIVAL")).toBe(false);
	});
});

describe("correlateAchievements legacy filtering", () => {
	const achievements = {
		achievementsPerGame: {
			arcade: {
				category: "arcade",
				achievements: [
					{
						codeName: "PTB_RIDE_BAT",
						name: "Party Games: Batman",
						description: "Ride a bat in Punch the Bat",
						type: "ONE_TIME",
						points: 5,
						rarity: { local: 0, global: 0 },
					},
					{
						codeName: "CREEPER_ATTACK_SURVIVAL",
						name: "Creeper Attack: Creeeep",
						description: "Survive Creeper Attack without dying",
						type: "ONE_TIME",
						points: 10,
						rarity: { local: 0, global: 0 },
					},
				],
			},
		},
	} as unknown as Achievements;

	const player: PlayerData = {
		uuid: "test-uuid",
		nickname: "Test",
		rank: null,
		rankPrefix: null,
		rankPlusColor: null,
		rankPrefixColor: null,
		achievementPoints: 0,
		tieredAchievements: {},
		oneTimeAchievements: ["arcade_ptb_ride_bat", "arcade_creeper_attack_survival"],
		quests: {},
	};

	it("excludes legacy achievements from views", () => {
		const views = correlateAchievements(
			achievements,
			player,
			new Set(["arcade_PTB_RIDE_BAT"]),
		);

		expect(views.map((view) => view.codeName)).toEqual([
			"CREEPER_ATTACK_SURVIVAL",
		]);
	});
});
