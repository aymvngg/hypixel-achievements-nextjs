import { describe, expect, it } from "vitest";
import {
	correlateQuests,
	type RawQuestsResponse,
} from "@/lib/hypixel/correlate-quests";
import type { PlayerQuestData } from "@/lib/hypixel/types";
import { getPeriodStart, formatResetIn, msUntilReset } from "@/lib/util/quest-resets";

const questDefs: RawQuestsResponse = {
	quests: {
		bedwars: [
			{
				id: "bedwars_daily_win",
				name: "Daily Quest: First Win",
				description: "Win a game of Bed Wars",
				objectives: [
					{
						id: "bedwars_daily_win",
						type: "IntegerObjective",
						integer: "1",
					},
				],
				requirements: [{ type: "DailyResetQuestRequirement" }],
				rewards: [
					{ type: "BedwarsExpReward", amount: 250 },
					{ type: "MultipliedCoinReward", amount: 250 },
				],
			},
			{
				id: "bedwars_weekly_final_killer",
				name: "Weekly Quest: Finishing the Job",
				description: "Final Kill 150 players in Bed Wars",
				objectives: [
					{
						id: "bedwars_weekly_final_killer",
						type: "IntegerObjective",
						integer: "150",
					},
				],
				requirements: [{ type: "WeeklyResetQuestRequirement" }],
				rewards: [{ type: "BedwarsExpReward", amount: 5000 }],
			},
			{
				id: "mega_walls_faithful",
				name: "Mythic Quest: Faithful",
				description: "Play 3 games",
				objectives: [
					{
						id: "mega_walls_faithful_play",
						type: "IntegerObjective",
						integer: "3",
					},
				],
				requirements: [{ type: "DailyResetQuestRequirement" }],
				rewards: [],
			},
		],
		hungergames: [
			{
				id: "blitz_game_of_the_day",
				name: "Daily Quest: Game of the Day",
				description: "Play a game of Blitz",
				objectives: [{ id: "blitz_games_played", type: "BooleanObjective" }],
				requirements: [{ type: "DailyResetQuestRequirement" }],
				rewards: [],
			},
		],
		skywars: [
			{
				id: "skywars_monthly_earn_opals",
				name: "Monthly Quest: Earn an Opal",
				description: "Earn an Opal",
				objectives: [
					{
						id: "skywars_earn_opals",
						type: "IntegerObjective",
						integer: "1",
					},
				],
				requirements: [{ type: "MonthlyResetQuestRequirement" }],
				rewards: [{ type: "SkyWarsOpalReward", amount: 1 }],
			},
		],
		walls3: [
			{
				id: "mega_walls_weekly",
				name: "Weekly Quest: Mega Waller",
				description: "Play 15 games\nKill 25 players",
				objectives: [
					{
						id: "mega_walls_play_weekly",
						type: "IntegerObjective",
						integer: "15",
					},
					{
						id: "mega_walls_kill_weekly",
						type: "IntegerObjective",
						integer: "25",
					},
				],
				requirements: [{ type: "WeeklyResetQuestRequirement" }],
				rewards: [{ type: "MultipliedCoinReward", amount: 4500 }],
			},
		],
	},
};

const dailyNow = getPeriodStart("DAILY") + 60_000;
const weeklyNow = getPeriodStart("WEEKLY") + 60_000;
const monthlyNow = getPeriodStart("MONTHLY") + 60_000;
const lastWeek = getPeriodStart("WEEKLY") - 86_400_000;

describe("correlateQuests", () => {
	it("maps hungergames API key to blitz UI game key", () => {
		const views = correlateQuests(questDefs, {}, dailyNow);
		const blitz = views.find((v) => v.questId === "blitz_game_of_the_day");
		expect(blitz?.game).toBe("blitz");
	});

	it("excludes mythic quests that are not standard reset types", () => {
		const views = correlateQuests(questDefs, {}, dailyNow);
		expect(views.some((v) => v.questId === "mega_walls_faithful")).toBe(
			false,
		);
	});

	it("marks quest completed when completion is within the daily period", () => {
		const playerQuests: PlayerQuestData = {
			bedwars_daily_win: {
				completions: [{ timeCompleted: dailyNow }],
			},
		};
		const views = correlateQuests(questDefs, playerQuests, dailyNow);
		const daily = views.find((v) => v.questId === "bedwars_daily_win");
		expect(daily?.status).toBe("completed");
		expect(daily?.objectives[0].progress).toBe(1);
		expect(daily?.progress).toBe(1);
	});

	it("reads Hypixel completion timestamps from the time field", () => {
		const playerQuests: PlayerQuestData = {
			arcade_winner: {
				completions: [{ time: dailyNow }],
			},
		};
		const defs: RawQuestsResponse = {
			quests: {
				arcade: [
					{
						id: "arcade_winner",
						name: "Daily Quest: Arcade Winner",
						description: "Win a game of Arcade",
						objectives: [
							{ id: "win", type: "IntegerObjective", integer: "1" },
						],
						requirements: [{ type: "DailyResetQuestRequirement" }],
					},
				],
			},
		};
		const views = correlateQuests(defs, playerQuests, dailyNow);
		const daily = views.find((v) => v.questId === "arcade_winner");
		expect(daily?.status).toBe("completed");
		expect(daily?.objectives[0].progress).toBe(1);
	});

	it("marks quest active with objective progress from player data", () => {
		const playerQuests: PlayerQuestData = {
			bedwars_weekly_final_killer: {
				active: {
					started: weeklyNow,
					objectives: { bedwars_weekly_final_killer: 42 },
				},
			},
		};
		const views = correlateQuests(questDefs, playerQuests, weeklyNow);
		const weekly = views.find(
			(v) => v.questId === "bedwars_weekly_final_killer",
		);
		expect(weekly?.status).toBe("active");
		expect(weekly?.objectives[0].progress).toBe(42);
		expect(weekly?.progress).toBe(42 / 150);
	});

	it("marks quest available when no active progress or recent completion", () => {
		const playerQuests: PlayerQuestData = {
			bedwars_weekly_final_killer: {
				completions: [{ timeCompleted: lastWeek }],
			},
		};
		const views = correlateQuests(questDefs, playerQuests, weeklyNow);
		const weekly = views.find(
			(v) => v.questId === "bedwars_weekly_final_killer",
		);
		expect(weekly?.status).toBe("available");
		expect(weekly?.objectives[0].progress).toBe(0);
	});

	it("includes monthly quests with MONTHLY type", () => {
		const views = correlateQuests(questDefs, {}, monthlyNow);
		const monthly = views.find(
			(v) => v.questId === "skywars_monthly_earn_opals",
		);
		expect(monthly?.type).toBe("MONTHLY");
	});

	it("aggregates multi-objective progress", () => {
		const playerQuests: PlayerQuestData = {
			mega_walls_weekly: {
				active: {
					started: weeklyNow,
					objectives: {
						mega_walls_play_weekly: 10,
						mega_walls_kill_weekly: 5,
					},
				},
			},
		};
		const views = correlateQuests(questDefs, playerQuests, weeklyNow);
		const weekly = views.find((v) => v.questId === "mega_walls_weekly");
		expect(weekly?.status).toBe("active");
		expect(weekly?.progress).toBe((10 / 15 + 5 / 25) / 2);
	});
});

describe("quest-resets", () => {
	it("detects daily period boundaries", () => {
		const start = getPeriodStart("DAILY", dailyNow);
		expect(dailyNow >= start).toBe(true);
		expect(lastWeek < start).toBe(true);
	});

	it("uses Eastern midnight for daily and weekly reset countdowns", () => {
		// Thursday 23:42 UTC+1 = 22:42 UTC = 18:42 EDT on Aug 6, 2026
		const now = Date.UTC(2026, 7, 6, 22, 42, 0);
		const dailyMs = msUntilReset("DAILY", now);
		const weeklyMs = msUntilReset("WEEKLY", now);

		expect(formatResetIn(dailyMs)).toBe("5h 18m");
		expect(formatResetIn(weeklyMs)).toBe("5h 18m");
	});

	it("uses Eastern month boundary for monthly reset countdown", () => {
		const now = Date.UTC(2026, 7, 6, 22, 42, 0);
		const monthlyMs = msUntilReset("MONTHLY", now);
		expect(formatResetIn(monthlyMs)).toBe("25d 5h 18m");
	});
});
