import { describe, expect, it } from "vitest";
import { deriveQuestMode, formatModeCountLabel } from "@/lib/util/quest-modes";

describe("deriveQuestMode", () => {
	it("extracts TNT Run from the quest id", () => {
		expect(
			deriveQuestMode("tntgames", {
				id: "tnt_tntrun_daily",
				name: "Daily Quest: TNT Run",
			}),
		).toEqual({ modeKeys: ["TNTRUN"], countsGame: undefined });
	});

	it("extracts Murder Mystery Infection", () => {
		expect(
			deriveQuestMode("murdermystery", {
				id: "mm_daily_infector",
				name: "Daily Quest: Infector",
			}),
		).toEqual({ modeKeys: ["MURDER_INFECTION"], countsGame: undefined });
	});

	it("maps TNT Wizards to the CAPTURE counts mode", () => {
		expect(
			deriveQuestMode("tntgames", {
				id: "tnt_wizards_daily",
				name: "Daily Quest: TNT Wizards",
			}),
		).toEqual({ modeKeys: ["CAPTURE"], countsGame: undefined });
	});

	it("labels the Bed Wars dream quest with a single Dreams tag", () => {
		const mode = deriveQuestMode("bedwars", {
			id: "bedwars_weekly_dream_win",
			name: "Weekly Quest: Sleep Tight.",
		});
		expect(mode?.label).toBe("Dreams");
		expect(mode?.modeKeys.length).toBeGreaterThan(1);
	});

	it("returns all modes for a multi-mode quest", () => {
		expect(
			deriveQuestMode("murdermystery", {
				id: "mm_daily_power_play",
				name: "Daily Quest: Power Play",
			}),
		).toEqual({
			modeKeys: ["MURDER_CLASSIC", "MURDER_DOUBLE_UP"],
			countsGame: undefined,
		});
	});

	it("leaves game-wide quests without a mode", () => {
		expect(
			deriveQuestMode("tntgames", {
				id: "tnt_daily_win",
				name: "Daily Quest: TNT Winner",
			}),
		).toBeUndefined();
	});
});

describe("formatModeCountLabel", () => {
	it("labels a single known mode", () => {
		expect(formatModeCountLabel("tntgames", ["TNTRUN"])).toBe("TNT Run");
		expect(formatModeCountLabel("tntgames", ["CAPTURE"])).toBe(
			"TNT Wizards",
		);
		expect(
			formatModeCountLabel("murdermystery", ["MURDER_INFECTION"]),
		).toBe("Infection");
	});

	it("joins multiple modes with a plus", () => {
		expect(
			formatModeCountLabel("murdermystery", [
				"MURDER_CLASSIC",
				"MURDER_DOUBLE_UP",
			]),
		).toBe("Classic + Double Up");
	});

	it("collapses duplicate labels shared between mode keys", () => {
		expect(
			formatModeCountLabel("bedwars", [
				"BEDWARS_EIGHT_TWO_LUCKY",
				"BEDWARS_FOUR_FOUR_LUCKY",
			]),
		).toBe("Lucky");
	});

	it("humanizes unknown mode keys", () => {
		expect(formatModeCountLabel("tntgames", ["FOO_BAR"])).toBe("Foo Bar");
	});
});
