import { describe, it, expect } from "vitest";
import {
	applyFilters,
	applySearch,
	applySorting,
	normalizeAchievementType,
} from "@/lib/util/filters";
import type { AchievementView } from "@/lib/hypixel/api";
import { validatePlayerQuery } from "@/lib/util/validate";

function view(
	overrides: Partial<AchievementView> & Pick<AchievementView, "name">,
): AchievementView {
	const { name, ...rest } = overrides;
	return {
		game: "SkyBlock",
		codeName: "test",
		name,
		description: "desc",
		type: "ONE_TIME",
		completed: false,
		points: 5,
		obtainedPoints: overrides.completed ? (overrides.points ?? 5) : 0,
		totalPoints: overrides.points ?? 5,
		gamePercentUnlocked: 10,
		globalPercentUnlocked: 5,
		currentTier: 0,
		maxTier: 1,
		progress: 0,
		tierTarget: 0,
		tierProgress: 0,
		...rest,
	};
}

describe("normalizeAchievementType", () => {
	it("converts one-time to ONE_TIME", () => {
		expect(normalizeAchievementType("one-time")).toBe("ONE_TIME");
	});
});

describe("applyFilters", () => {
	const views = [
		view({
			name: "A",
			game: "SkyBlock",
			type: "ONE_TIME",
			completed: true,
		}),
		view({ name: "B", game: "BedWars", type: "TIERED", completed: false }),
	];

	it("filters by game", () => {
		const result = applyFilters(views, "BedWars", undefined, undefined);
		expect(result.length).toBe(1);
		expect(result[0].name).toBe("B");
	});
});

describe("applySearch", () => {
	it("matches achievement names and descriptions", () => {
		const views = [
			view({ name: "Win a game", description: "Play Bed Wars" }),
			view({ name: "Collector", description: "Gather resources" }),
		];

		expect(applySearch(views, "bed").map((v) => v.name)).toEqual([
			"Win a game",
		]);
		expect(applySearch(views, "resources").map((v) => v.name)).toEqual([
			"Collector",
		]);
	});
});

describe("applySorting", () => {
	const views = [
		view({ name: "B", points: 20 }),
		view({ name: "A", points: 10 }),
	];

	it("sorts by name ascending", () => {
		const result = applySorting(views, "name", false);
		expect(result.map((v) => v.name)).toEqual(["A", "B"]);
	});

	it("sorts tiered progress by closeness to next tier target", () => {
		const tiered = [
			view({ name: "Far", type: "TIERED", tierProgress: 0.2 }),
			view({ name: "Close", type: "TIERED", tierProgress: 0.9 }),
			view({ name: "Mid", type: "TIERED", tierProgress: 0.5 }),
		];
		const result = applySorting(tiered, "progress", true);
		expect(result.map((v) => v.name)).toEqual(["Close", "Mid", "Far"]);
	});
});

describe("validatePlayerQuery", () => {
	it("accepts valid username", () => {
		expect(validatePlayerQuery("Steve")).toBe("Steve");
	});

	it("rejects empty query", () => {
		expect(() => validatePlayerQuery("")).toThrow(/required/);
	});
});
