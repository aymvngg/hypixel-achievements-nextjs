export interface ColoredSegment {
	text: string;
	color: string;
}

/** Hypixel chat colors (matches hypixel-api-reborn Color.toHex). */
export const HYPIXEL_HEX = {
	GREEN: "#3CE63C",
	AQUA: "#3CE6E6",
	RED: "#FF5555",
	GOLD: "#FFAA00",
	GRAY: "#AAAAAA",
	DARK_GREEN: "#008000",
	DARK_RED: "#AA0000",
	DARK_BLUE: "#0000AA",
	LIGHT_PURPLE: "#FF55FF",
	WHITE: "#FFFFFF",
} as const;

const DEFAULT_PLUS = HYPIXEL_HEX.RED;
const DEFAULT_PREFIX = HYPIXEL_HEX.GOLD;
const VIP_PLUS_SIGN = HYPIXEL_HEX.GOLD;

const MC_COLOR_CODES: Record<string, string> = {
	"0": "#000000",
	"1": HYPIXEL_HEX.DARK_BLUE,
	"2": HYPIXEL_HEX.DARK_GREEN,
	"3": "#00AAAA",
	"4": HYPIXEL_HEX.DARK_RED,
	"5": "#AA00AA",
	"6": HYPIXEL_HEX.GOLD,
	"7": HYPIXEL_HEX.GRAY,
	"8": "#555555",
	"9": "#5555FF",
	a: HYPIXEL_HEX.GREEN,
	b: HYPIXEL_HEX.AQUA,
	c: HYPIXEL_HEX.RED,
	d: HYPIXEL_HEX.LIGHT_PURPLE,
	e: "#FFFF55",
	f: HYPIXEL_HEX.WHITE,
};

const RANK_COLORS: Record<string, string> = {
	VIP: HYPIXEL_HEX.GREEN,
	MVP: HYPIXEL_HEX.AQUA,
	YouTube: HYPIXEL_HEX.RED,
	"Game Master": HYPIXEL_HEX.DARK_GREEN,
	Admin: HYPIXEL_HEX.RED,
	"PIG+++": HYPIXEL_HEX.LIGHT_PURPLE,
	INNIT: HYPIXEL_HEX.WHITE,
	Default: HYPIXEL_HEX.GRAY,
};

/** Ranks with no visible tab-list prefix (default / non-ranked players). */
export function hasDisplayableRank(
	rank: string | null | undefined,
): rank is string {
	return Boolean(rank && rank !== "Default");
}

/**
 * Colored segments for the rank prefix (e.g. [MVP++]).
 * MVP++/MVP+ plus signs use rankPlusColor; MVP++ tag (MVP + brackets) uses monthlyRankColor.
 * @see https://github.com/HypixelDev/PublicAPI/wiki/Common-Questions
 */
export function formatRankPrefix(
	rank: string,
	plusColorHex?: string | null,
	prefixColorHex?: string | null,
	rawPrefix?: string | null,
): ColoredSegment[] {
	const segments = buildRankPrefixSegments(
		rank,
		plusColorHex,
		prefixColorHex,
		rawPrefix,
	);
	return mergeColoredSegments(segments);
}

function buildRankPrefixSegments(
	rank: string,
	plusColorHex?: string | null,
	prefixColorHex?: string | null,
	rawPrefix?: string | null,
): ColoredSegment[] {
	const plus = plusColorHex ?? DEFAULT_PLUS;
	const prefix = prefixColorHex ?? DEFAULT_PREFIX;

	if (rawPrefix) {
		return parseMinecraftColoredText(rawPrefix, true);
	}

	switch (rank) {
		case "MVP++":
			return [
				{ text: "[", color: prefix },
				{ text: "MVP", color: prefix },
				{ text: "+", color: plus },
				{ text: "+", color: plus },
				{ text: "] ", color: prefix },
			];
		case "MVP+": {
			const mvp = RANK_COLORS.MVP;
			return [
				{ text: "[", color: mvp },
				{ text: "MVP", color: mvp },
				{ text: "+", color: plus },
				{ text: "] ", color: mvp },
			];
		}
		case "VIP+": {
			const vip = RANK_COLORS.VIP;
			return [
				{ text: "[", color: vip },
				{ text: "VIP", color: vip },
				{ text: "+", color: VIP_PLUS_SIGN },
				{ text: "] ", color: vip },
			];
		}
		case "VIP":
		case "MVP": {
			const base = RANK_COLORS[rank];
			return [{ text: `[${rank}] `, color: base }];
		}
		case "YouTube": {
			return [
				{ text: "[", color: RANK_COLORS.YouTube },
				{ text: "YOUTUBE", color: HYPIXEL_HEX.WHITE },
				{ text: "] ", color: RANK_COLORS.YouTube },
			];
		}
		case "STAFF": {
			return [
				{ text: "[", color: HYPIXEL_HEX.RED },
				{ text: "ዞ", color: HYPIXEL_HEX.GOLD },
				{ text: "] ", color: HYPIXEL_HEX.RED },
			];
		}
		default: {
			const base = RANK_COLORS[rank] ?? RANK_COLORS.Default;
			return [{ text: `[${rank}] `, color: base }];
		}
	}
}

export function parseMinecraftColoredText(
	rawText: string,
	appendTrailingSpace = false,
): ColoredSegment[] {
	const segments: ColoredSegment[] = [];
	let currentColor: string = DEFAULT_PREFIX;
	let buffer = "";

	const flush = () => {
		if (!buffer) return;
		segments.push({ text: buffer, color: currentColor });
		buffer = "";
	};

	for (let i = 0; i < rawText.length; i++) {
		const char = rawText[i];
		if (char === "§" && i + 1 < rawText.length) {
			const mapped = MC_COLOR_CODES[rawText[i + 1].toLowerCase()];
			if (mapped) {
				flush();
				currentColor = mapped;
				i += 1;
				continue;
			}
		}
		buffer += char;
	}

	flush();

	if (appendTrailingSpace) {
		segments.push({ text: " ", color: currentColor });
	}

	return segments;
}

/** Hypixel tab-list nickname color (name after the prefix). */
export function getNicknameColor(
	rank: string | null,
	rankPrefixColorHex?: string | null,
): string {
	switch (rank) {
		case "VIP":
		case "VIP+":
			return HYPIXEL_HEX.GREEN;
		case "MVP":
		case "MVP+":
			return HYPIXEL_HEX.AQUA;
		case "MVP++":
			// /rankcolor tag choice (monthlyRankColor): gold or aqua — nickname matches the tag
			return rankPrefixColorHex ?? HYPIXEL_HEX.GOLD;
		case "YouTube":
			return HYPIXEL_HEX.RED;
		case "Game Master":
			return HYPIXEL_HEX.DARK_GREEN;
		case "Admin":
			return HYPIXEL_HEX.RED;
		case "STAFF":
			return HYPIXEL_HEX.RED;
		case "PIG+++":
			return HYPIXEL_HEX.LIGHT_PURPLE;
		case "INNIT":
			return HYPIXEL_HEX.LIGHT_PURPLE;
		case "Default":
		case "":
			return HYPIXEL_HEX.GRAY;
		default:
			return HYPIXEL_HEX.GRAY;
	}
}

/** Merge adjacent segments with the same color (e.g. `++` in one span). */
export function mergeColoredSegments(
	segments: ColoredSegment[],
): ColoredSegment[] {
	if (segments.length === 0) return segments;
	const merged: ColoredSegment[] = [{ ...segments[0] }];
	for (let i = 1; i < segments.length; i++) {
		const prev = merged[merged.length - 1];
		const curr = segments[i];
		if (prev.color === curr.color) {
			prev.text += curr.text;
		} else {
			merged.push({ ...curr });
		}
	}
	return merged;
}
