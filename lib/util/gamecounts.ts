import type { RawCountsResponse } from "@/lib/hypixel/api";

/**
 * Maps Hypixel gamecounts top-level game keys (uppercase Database Names) to
 * the UI game keys used elsewhere in the app. Keys not listed here normalize
 * to their lowercase form (e.g. ARCADE -> arcade).
 */
const COUNTS_API_TO_UI: Record<string, string> = {
	MCGO: "copsandcrims",
	BATTLEGROUND: "warlords",
	SURVIVAL_GAMES: "blitz",
	SUPER_SMASH: "supersmash",
	WOOL_GAMES: "woolgames",
	WALLS3: "walls3",
	MURDER_MYSTERY: "murdermystery",
	BUILD_BATTLE: "buildbattle",
	TNTGAMES: "tntgames",
	SPEED_UHC: "speeduhc",
};

/**
 * Classic games are reported under the `LEGACY` group's `modes` rather than as
 * top-level games. These keys map the legacy sub-mode keys to UI game keys.
 */
const LEGACY_MODE_TO_UI: Record<string, string> = {
	QUAKECRAFT: "quake",
	WALLS: "walls",
	PAINTBALL: "paintball",
	GINGERBREAD: "gingerbread",
	ARENA: "arena",
	VAMPIREZ: "vampirez",
};

/**
 * Top-level counts keys that are not real games (lobbies, queues, replays) or
 * are handled specially (LEGACY is split into its sub-modes). These are skipped
 * so the top-level `LEGACY` aggregate count does not shadow its sub-games.
 */
const COUNTS_NON_GAME_KEYS = new Set([
	"MAIN_LOBBY",
	"TOURNAMENT_LOBBY",
	"SMP",
	"REPLAY",
	"PROTOTYPE",
	"LIMBO",
	"IDLE",
	"QUEUE",
	"LEGACY",
]);

export function normalizeCountsGameKey(key: string): string {
	return COUNTS_API_TO_UI[key] ?? key.toLowerCase();
}

/**
 * Converts a raw gamecounts response into a map of UI game key -> player count.
 * Top-level games are normalized; classic games nested under `LEGACY.modes`
 * are extracted as individual entries.
 */
export function mapCountsToUiGames(
	raw: RawCountsResponse,
): Record<string, number> {
	const out: Record<string, number> = {};
	const games = raw.games ?? {};
	for (const [key, entry] of Object.entries(games)) {
		if (COUNTS_NON_GAME_KEYS.has(key)) {
			if (key === "LEGACY" && entry?.modes) {
				for (const [modeKey, count] of Object.entries(entry.modes)) {
					const uiKey = LEGACY_MODE_TO_UI[modeKey];
					if (uiKey && typeof count === "number") out[uiKey] = count;
				}
			}
			continue;
		}
		const players = entry?.players;
		if (typeof players !== "number") continue;
		out[normalizeCountsGameKey(key)] = players;
	}
	return out;
}

const compactFormatter = new Intl.NumberFormat("en", {
	notation: "compact",
	maximumFractionDigits: 1,
});

/** Formats a player count compactly, e.g. 4231 -> "4.2k", 22110 -> "22k". */
export function formatPlayerCount(count: number): string {
	if (count < 1000) return String(count);
	return compactFormatter.format(count).toLowerCase();
}
