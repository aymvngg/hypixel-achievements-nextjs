import type { RawQuestDefinition } from "@/lib/hypixel/correlate-quests";

interface QuestModeMatch {
	tokens: string[];
	modeKeys: string[];
	countsGame?: string;
	/** Replaces the joined per-mode labels when a single tag is clearer. */
	label?: string;
}

/**
 * Quest resources do not expose a separate mode field. These stable quest-id
 * tokens identify the modes that have corresponding gamecounts entries.
 * Entries are ordered from specific to general to avoid partial matches.
 */
const QUEST_MODE_MATCHES: Record<string, QuestModeMatch[]> = {
	tntgames: [
		{ tokens: ["bowspleef"], modeKeys: ["BOWSPLEEF"] },
		{ tokens: ["tntrun"], modeKeys: ["TNTRUN"] },
		{ tokens: ["tnttag"], modeKeys: ["TNTAG"] },
		{ tokens: ["pvprun"], modeKeys: ["PVPRUN"] },
		{ tokens: ["wizards"], modeKeys: ["CAPTURE"] },
	],
	murdermystery: [
		{
			tokens: ["power_play"],
			modeKeys: ["MURDER_CLASSIC", "MURDER_DOUBLE_UP"],
		},
		{ tokens: ["target_kill"], modeKeys: ["MURDER_ASSASSINS"] },
		{ tokens: ["infector"], modeKeys: ["MURDER_INFECTION"] },
	],
	mcgo: [
		{
			tokens: ["cvc_kill_weekly"],
			modeKeys: ["normal", "deathmatch", "gungame"],
		},
		{ tokens: ["gungame"], modeKeys: ["gungame"] },
		{ tokens: ["deathmatch"], modeKeys: ["deathmatch"] },
		{ tokens: ["normal"], modeKeys: ["normal"] },
	],
	battleground: [
		{
			tokens: ["warlords_objectives"],
			modeKeys: ["ctf_mini", "domination", "team_deathmatch"],
		},
		{ tokens: ["ctf"], modeKeys: ["ctf_mini"] },
		{ tokens: ["domination"], modeKeys: ["domination"] },
		{ tokens: ["tdm"], modeKeys: ["team_deathmatch"] },
	],
	supersmash: [
		{ tokens: ["team"], modeKeys: ["teams_normal"] },
		{ tokens: ["solo"], modeKeys: ["solo_normal"] },
	],
	skywars: [
		{ tokens: ["mini"], modeKeys: ["mini_normal"] },
		{
			tokens: ["arcade", "lucky"],
			modeKeys: ["solo_insane_lucky", "teams_insane_lucky"],
		},
		{ tokens: ["mega"], modeKeys: ["mega_doubles"] },
		{ tokens: ["team"], modeKeys: ["teams_normal"] },
		{ tokens: ["solo"], modeKeys: ["solo_normal"] },
	],
	uhc: [
		{ tokens: ["uhc_team"], modeKeys: ["TEAMS"] },
		{ tokens: ["uhc_solo"], modeKeys: ["SOLO"] },
	],
	bedwars: [
		{
			tokens: ["bedwars_weekly_dream_win"],
			label: "Dreams",
			modeKeys: [
				"BEDWARS_CASTLE",
				"BEDWARS_EIGHT_TWO_LUCKY",
				"BEDWARS_EIGHT_TWO_RUSH",
				"BEDWARS_EIGHT_TWO_SWAP",
				"BEDWARS_EIGHT_TWO_UNDERWORLD",
				"BEDWARS_EIGHT_TWO_ULTIMATE",
				"BEDWARS_EIGHT_TWO_VOIDLESS",
				"BEDWARS_FOUR_FOUR_ARMED",
				"BEDWARS_FOUR_FOUR_LUCKY",
				"BEDWARS_FOUR_FOUR_RUSH",
				"BEDWARS_FOUR_FOUR_SWAP",
				"BEDWARS_FOUR_FOUR_UNDERWORLD",
				"BEDWARS_FOUR_FOUR_ULTIMATE",
				"BEDWARS_FOUR_FOUR_VOIDLESS",
				"BEDWARS_EIGHT_ONE_ONEBLOCK",
			],
		},
	],
	walls3: [
		{ tokens: ["standard"], modeKeys: ["standard"] },
		{ tokens: ["face_off"], modeKeys: ["face_off"] },
	],
};

/**
 * Human-readable labels for the raw gamecounts mode keys, keyed by UI game.
 * Labels let the UI show which specific mode a player count was sourced from.
 */
const MODE_LABELS: Record<string, Record<string, string>> = {
	tntgames: {
		BOWSPLEEF: "Bow Spleef",
		TNTRUN: "TNT Run",
		TNTAG: "TNT Tag",
		PVPRUN: "PVP Run",
		CAPTURE: "TNT Wizards",
	},
	murdermystery: {
		MURDER_CLASSIC: "Classic",
		MURDER_DOUBLE_UP: "Double Up",
		MURDER_ASSASSINS: "Assassins",
		MURDER_INFECTION: "Infection",
	},
	mcgo: {
		normal: "Defusal",
		deathmatch: "Deathmatch",
		gungame: "Gun Game",
	},
	battleground: {
		ctf_mini: "Capture the Flag",
		domination: "Domination",
		team_deathmatch: "Team Deathmatch",
	},
	supersmash: {
		solo_normal: "Solo",
		teams_normal: "Teams",
	},
	skywars: {
		solo_normal: "Solo",
		teams_normal: "Doubles",
		mini_normal: "Mini",
		mega_doubles: "Mega",
		solo_insane_lucky: "Lucky Block",
		teams_insane_lucky: "Lucky Block",
	},
	uhc: {
		TEAMS: "Teams",
		SOLO: "Solo",
	},
	walls3: {
		standard: "Standard",
		face_off: "Face Off",
	},
	bedwars: {
		BEDWARS_CASTLE: "Castle",
		BEDWARS_EIGHT_TWO_ARMED: "Armed",
		BEDWARS_EIGHT_TWO_LUCKY: "Lucky",
		BEDWARS_EIGHT_TWO_RUSH: "Rush",
		BEDWARS_EIGHT_TWO_SWAP: "Swap",
		BEDWARS_EIGHT_TWO_UNDERWORLD: "Underworld",
		BEDWARS_EIGHT_TWO_ULTIMATE: "Ultimate",
		BEDWARS_EIGHT_TWO_VOIDLESS: "Voidless",
		BEDWARS_FOUR_FOUR_ARMED: "Armed",
		BEDWARS_FOUR_FOUR_LUCKY: "Lucky",
		BEDWARS_FOUR_FOUR_RUSH: "Rush",
		BEDWARS_FOUR_FOUR_SWAP: "Swap",
		BEDWARS_FOUR_FOUR_UNDERWORLD: "Underworld",
		BEDWARS_FOUR_FOUR_ULTIMATE: "Ultimate",
		BEDWARS_FOUR_FOUR_VOIDLESS: "Voidless",
		BEDWARS_EIGHT_ONE_ONEBLOCK: "One Block",
	},
};

function humanizeModeKey(modeKey: string): string {
	return modeKey
		.toLowerCase()
		.replace(/_/g, " ")
		.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Formats the mode keys that contributed to a player count into a readable
 * tag, e.g. ["MURDER_CLASSIC", "MURDER_DOUBLE_UP"] -> "Classic + Double Up".
 * Duplicate labels (shared between mode keys) are collapsed.
 */
export function formatModeCountLabel(game: string, modeKeys: string[]): string {
	const labels = new Set<string>();
	for (const modeKey of modeKeys) {
		labels.add(MODE_LABELS[game]?.[modeKey] ?? humanizeModeKey(modeKey));
	}
	return [...labels].join(" + ");
}

export interface QuestMode {
	modeKeys: string[];
	countsGame?: string;
	/** Single tag replacing the joined mode labels, when set. */
	label?: string;
}

export function deriveQuestMode(
	game: string,
	def: Pick<RawQuestDefinition, "id" | "name">,
): QuestMode | undefined {
	const matches = QUEST_MODE_MATCHES[game];
	if (!matches) return undefined;

	const haystack = `${def.id} ${def.name}`.toLowerCase();
	const match = matches.find(({ tokens }) =>
		tokens.some((token) => haystack.includes(token)),
	);
	if (!match) return undefined;

	return {
		modeKeys: match.modeKeys,
		countsGame: match.countsGame,
		label: match.label,
	};
}
