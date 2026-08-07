import type { PlayerBadgeType } from "@/lib/util/special-players";

export const PLAYER_TAG_STYLES: Record<
	PlayerBadgeType,
	{ label: string; color: string }
> = {
	owner: {
		label: "OWNER",
		color: "#8e2be2",
	},
	"early-tester": {
		label: "EARLY TESTER",
		color: "var(--color-mc-sky)",
	},
	mommy: {
		label: "❤️MOMMY❤️",
		color: "#ff69b4",
	},
	technoblade: {
		label: "NEVER DIES",
		color: "#ff55ff",
	},
	bored: {
		label: "BORED",
		color: "#ff5555",
	},
	ladybug: {
		label: "LADYBUG",
		color: "#c1fefa",
	},
};

const STYLES = PLAYER_TAG_STYLES;

/** How the tag renders relative to the player name. */
export type TagDisplayVariant = "inline" | "small" | "block" | "pill";

export function PlayerBadge({
	type,
	variant = "pill",
}: {
	type: PlayerBadgeType;
	variant?: TagDisplayVariant;
}) {
	const { label, color } = STYLES[type];
	const style =
		variant === "inline"
			? "whitespace-nowrap"
			: variant === "small"
				? "whitespace-nowrap text-[0.72em] align-middle"
				: variant === "pill"
					? "whitespace-nowrap inline-flex items-center px-1.5 py-0.5 text-[0.65em] font-[family-name:var(--font-pixel)] border-2 rounded-sm leading-none uppercase bg-black/30 border-mc-border"
					: "whitespace-nowrap inline-flex items-center px-1.5 py-0.5 text-[0.65em] border-2 rounded-sm leading-none uppercase bg-black/30 border-mc-border";
	return (
		<span className={style} style={{ color }}>
			{variant === "block" || variant === "pill"
				? label
				: `[${label}]`}
		</span>
	);
}
