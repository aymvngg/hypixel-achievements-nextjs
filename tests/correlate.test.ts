import { describe, it, expect } from "vitest";
import type { Achievements } from "hypixel-api-reborn";
import type { PlayerData } from "@/lib/hypixel/types";
import { correlateAchievements } from "@/lib/hypixel/correlate";

const achievements = {
	achievementsPerGame: {
		skyblock: {
			category: "skyblock",
			achievements: [
				{
					codeName: "FIRST_JOIN",
					name: "First Join",
					description: "Join SkyBlock",
					type: "ONE_TIME",
					points: 5,
					rarity: { local: 50, global: 40 },
				},
				{
					codeName: "COLLECTIONS",
					name: "Collections",
					description: "Collect %%value%% items",
					type: "TIERED",
					points: 25,
					rarity: { local: 10, global: 5 },
					tierInformation: {
						maxTier: 2,
						tierInfo: [
							{ amount: "10", points: 5 },
							{ amount: "100", points: 20 },
						],
					},
				},
			],
		},
	},
} as unknown as Achievements;

function player(overrides: Partial<PlayerData> = {}): PlayerData {
	return {
		uuid: "test-uuid",
		nickname: "Test",
		rank: null,
		rankPrefix: null,
		rankPlusColor: null,
		rankPrefixColor: null,
		achievementPoints: 0,
		tieredAchievements: {},
		oneTimeAchievements: [],
		...overrides,
	};
}

describe("correlateAchievements", () => {
	it("marks one-time achievements completed from achievementsOneTime", () => {
		const views = correlateAchievements(
			achievements,
			player({ oneTimeAchievements: ["skyblock_first_join"] }),
		);
		const firstJoin = views.find((v) => v.codeName === "FIRST_JOIN");
		expect(firstJoin?.completed).toBe(true);
		expect(firstJoin?.obtainedPoints).toBe(5);
	});

	it("does not mark one-time achievements completed from tieredAchievements alone", () => {
		const views = correlateAchievements(
			achievements,
			player({
				tieredAchievements: { skyblockFirstJoin: 1 },
				oneTimeAchievements: [],
			}),
		);
		const firstJoin = views.find((v) => v.codeName === "FIRST_JOIN");
		expect(firstJoin?.completed).toBe(false);
		expect(firstJoin?.obtainedPoints).toBe(0);
	});

	it("marks tiered achievements completed from tieredAchievements progress", () => {
		const views = correlateAchievements(
			achievements,
			player({ tieredAchievements: { skyblockCollections: 100 } }),
		);
		const collections = views.find((v) => v.codeName === "COLLECTIONS");
		expect(collections?.completed).toBe(true);
		expect(collections?.currentTier).toBe(2);
		expect(collections?.obtainedPoints).toBe(25);
	});

	it("counts partial tier AP without marking tiered achievement completed", () => {
		const views = correlateAchievements(
			achievements,
			player({ tieredAchievements: { skyblockCollections: 10 } }),
		);
		const collections = views.find((v) => v.codeName === "COLLECTIONS");
		expect(collections?.completed).toBe(false);
		expect(collections?.currentTier).toBe(1);
		expect(collections?.obtainedPoints).toBe(5);
		expect(collections?.tierTarget).toBe(100);
		expect(collections?.tierProgress).toBe(0.1);
	});

	it("computes tier progress as current stat over next tier target", () => {
		const views = correlateAchievements(
			achievements,
			player({ tieredAchievements: { skyblockCollections: 75 } }),
		);
		const collections = views.find((v) => v.codeName === "COLLECTIONS");
		expect(collections?.tierProgress).toBe(0.75);
	});
});
