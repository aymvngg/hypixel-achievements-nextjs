import { describe, it, expect } from "vitest";
import {
	formatPlayerCount,
	mapCountsToUiGames,
	normalizeCountsGameKey,
} from "@/lib/util/gamecounts";
import type { RawCountsResponse } from "@/lib/hypixel/api";

const sample: RawCountsResponse = {
	playerCount: 100000,
	games: {
		MAIN_LOBBY: { players: 200 },
		LIMBO: { players: 500 },
		IDLE: { players: 100 },
		QUEUE: { players: 0 },
		SMP: { players: 800 },
		REPLAY: { players: 10 },
		PROTOTYPE: { players: 50 },
		ARCADE: { players: 700 },
		UHC: { players: 40 },
		TNTGAMES: { players: 190 },
		MCGO: { players: 36 },
		SUPER_SMASH: { players: 3 },
		WOOL_GAMES: { players: 93 },
		SKYBLOCK: { players: 22000 },
		SKYWARS: { players: 320 },
		DUELS: { players: 600 },
		PIT: { players: 340 },
		BATTLEGROUND: { players: 25 },
		SURVIVAL_GAMES: { players: 68 },
		WALLS3: { players: 90 },
		SPEED_UHC: { players: 0 },
		BUILD_BATTLE: { players: 780 },
		BEDWARS: { players: 4500 },
		MURDER_MYSTERY: { players: 370 },
		HOUSING: { players: 980 },
		LEGACY: {
			players: 14,
			modes: {
				PAINTBALL: 2,
				WALLS: 1,
				GINGERBREAD: 3,
				ARENA: 4,
				QUAKECRAFT: 2,
				VAMPIREZ: 2,
			},
		},
	},
};

describe("normalizeCountsGameKey", () => {
	it("maps aliased game keys to UI keys", () => {
		expect(normalizeCountsGameKey("MCGO")).toBe("copsandcrims");
		expect(normalizeCountsGameKey("BATTLEGROUND")).toBe("warlords");
		expect(normalizeCountsGameKey("SURVIVAL_GAMES")).toBe("blitz");
		expect(normalizeCountsGameKey("SUPER_SMASH")).toBe("supersmash");
		expect(normalizeCountsGameKey("WOOL_GAMES")).toBe("woolgames");
		expect(normalizeCountsGameKey("WALLS3")).toBe("walls3");
		expect(normalizeCountsGameKey("MURDER_MYSTERY")).toBe("murdermystery");
		expect(normalizeCountsGameKey("BUILD_BATTLE")).toBe("buildbattle");
	});

	it("lowercases unmapped keys", () => {
		expect(normalizeCountsGameKey("ARCADE")).toBe("arcade");
		expect(normalizeCountsGameKey("BEDWARS")).toBe("bedwars");
	});
});

describe("mapCountsToUiGames", () => {
	const mapped = mapCountsToUiGames(sample);

	it("maps top-level games via aliases", () => {
		expect(mapped.bedwars).toBe(4500);
		expect(mapped.copsandcrims).toBe(36);
		expect(mapped.warlords).toBe(25);
		expect(mapped.blitz).toBe(68);
		expect(mapped.supersmash).toBe(3);
		expect(mapped.woolgames).toBe(93);
		expect(mapped.murdermystery).toBe(370);
		expect(mapped.buildbattle).toBe(780);
		expect(mapped.skyblock).toBe(22000);
	});

	it("extracts classic games from the LEGACY group modes", () => {
		expect(mapped.quake).toBe(2);
		expect(mapped.walls).toBe(1);
		expect(mapped.paintball).toBe(2);
		expect(mapped.gingerbread).toBe(3);
		expect(mapped.arena).toBe(4);
		expect(mapped.vampirez).toBe(2);
	});

	it("does not leak the LEGACY aggregate count", () => {
		expect(mapped.LEGACY).toBeUndefined();
		expect(mapped.legacy).toBeUndefined();
	});

	it("excludes non-game categories (lobbies, queues, replay, smp)", () => {
		expect(mapped.MAIN_LOBBY).toBeUndefined();
		expect(mapped.main_lobby).toBeUndefined();
		expect(mapped.LIMBO).toBeUndefined();
		expect(mapped.limbo).toBeUndefined();
		expect(mapped.IDLE).toBeUndefined();
		expect(mapped.idle).toBeUndefined();
		expect(mapped.QUEUE).toBeUndefined();
		expect(mapped.SMP).toBeUndefined();
		expect(mapped.smp).toBeUndefined();
		expect(mapped.REPLAY).toBeUndefined();
		expect(mapped.PROTOTYPE).toBeUndefined();
	});

	it("handles an empty games object", () => {
		expect(mapCountsToUiGames({ playerCount: 0, games: {} })).toEqual({});
	});

	it("tolerates missing games field", () => {
		expect(
			mapCountsToUiGames({ playerCount: 0, games: undefined as never }),
		).toEqual({});
	});

	it("still emits zero-player games", () => {
		expect(mapped.speeduhc).toBe(0);
	});
});

describe("formatPlayerCount", () => {
	it("renders counts under 1000 verbatim", () => {
		expect(formatPlayerCount(0)).toBe("0");
		expect(formatPlayerCount(5)).toBe("5");
		expect(formatPlayerCount(999)).toBe("999");
	});

	it("renders thousands compactly with one decimal", () => {
		expect(formatPlayerCount(4500)).toBe("4.5k");
	});

	it("renders large counts in compact k notation", () => {
		expect(formatPlayerCount(22000)).toBe("22k");
	});
});
