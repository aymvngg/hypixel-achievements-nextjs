import { describe, it, expect } from "vitest";
import {
	filterRemovedGames,
	formatGameLabel,
	isRemovedGame,
} from "@/lib/util/games";

describe("formatGameLabel", () => {
	it("formats known games", () => {
		expect(formatGameLabel("halloween2017")).toBe("Halloween");
		expect(formatGameLabel("skyblock")).toBe("SkyBlock");
		expect(formatGameLabel("bedwars")).toBe("Bed Wars");
	});

	it("falls back to raw id for unmapped games", () => {
		expect(formatGameLabel("unknowngame")).toBe("unknowngame");
	});
});

describe("removed games", () => {
	it("flags removed games", () => {
		expect(isRemovedGame("skyclash")).toBe(true);
		expect(isRemovedGame("skyblock")).toBe(false);
	});

	it("filters removed games from lists", () => {
		const games = ["skyblock", "bedwars", "easter", "truecombat"];
		expect(filterRemovedGames(games)).toEqual([
			"skyblock",
			"bedwars",
			"easter",
		]);
	});
});
