import { HYPIXEL_HEX, parseMinecraftColoredText } from "@/lib/util/rank-format"
import { plusGlyphStyle } from "@/lib/font/plus-glyph-style"

const DEFAULT_PLUS = HYPIXEL_HEX.RED
const DEFAULT_PREFIX = HYPIXEL_HEX.GOLD
const VIP_PLUS_SIGN = HYPIXEL_HEX.GOLD

const RANK_COLORS: Record<string, string> = {
	VIP: HYPIXEL_HEX.GREEN,
	MVP: HYPIXEL_HEX.AQUA,
	YouTube: HYPIXEL_HEX.RED,
	"Game Master": HYPIXEL_HEX.DARK_GREEN,
	Admin: HYPIXEL_HEX.RED,
	"PIG+++": HYPIXEL_HEX.LIGHT_PURPLE,
	INNIT: HYPIXEL_HEX.WHITE,
	Default: HYPIXEL_HEX.GRAY,
}

/**
 * Nested inline spans keep + on the same text line box as letters (no manual offset).
 * Pattern: [MVP<span>++</span>]
 */
export function RankPrefix({
	rank,
	plusColorHex,
	prefixColorHex,
	rawPrefix,
}: {
	rank: string
	plusColorHex?: string | null
	prefixColorHex?: string | null
	rawPrefix?: string | null
}) {
	const plus = plusColorHex ?? DEFAULT_PLUS
	const prefix = prefixColorHex ?? DEFAULT_PREFIX

	if (rawPrefix) {
		return (
			<span>
				{parseMinecraftColoredText(rawPrefix, true).map((segment, index) => (
					<span key={`${segment.text}-${index}`} style={{ color: segment.color }}>
						{segment.text}
					</span>
				))}
			</span>
		)
	}

	switch (rank) {
		case "MVP++":
			return (
				<span style={{ color: prefix }}>
					[MVP<span style={plusGlyphStyle(plus)}>++</span>]{" "}
				</span>
			)
		case "MVP+":
			return (
				<span style={{ color: RANK_COLORS.MVP }}>
					[MVP<span style={plusGlyphStyle(plus)}>+</span>]{" "}
				</span>
			)
		case "VIP+":
			return (
				<span style={{ color: RANK_COLORS.VIP }}>
					[VIP<span style={plusGlyphStyle(VIP_PLUS_SIGN)}>+</span>]{" "}
				</span>
			)
		case "VIP":
		case "MVP":
			return <span style={{ color: RANK_COLORS[rank] }}>[{rank}] </span>
		case "YouTube":
			return (
				<span>
					<span style={{ color: RANK_COLORS.YouTube }}>[</span>
					<span style={{ color: HYPIXEL_HEX.WHITE }}>YOUTUBE</span>
					<span style={{ color: RANK_COLORS.YouTube }}>] </span>
				</span>
			)
		case "STAFF":
			return (
				<span>
					<span style={{ color: HYPIXEL_HEX.RED }}>[</span>
					<span style={{ color: HYPIXEL_HEX.GOLD }}>ዞ</span>
					<span style={{ color: HYPIXEL_HEX.RED }}>] </span>
				</span>
			)
		default:
			return <span style={{ color: RANK_COLORS[rank] ?? RANK_COLORS.Default }}>[{rank}] </span>
	}
}
