import type { PlayerBadgeType } from "@/lib/util/special-players";

const STYLES: Record<PlayerBadgeType, { label: string; color: string }> = {
	owner: {
		label: "OWNER",
		color: "var(--color-mc-gold)",
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
		color: "var(--color-mc-red)",
	},
};

export function PlayerBadge({ type }: { type: PlayerBadgeType }) {
	const { label, color } = STYLES[type];
	return (
		<span className="whitespace-nowrap" style={{ color }}>
			[{label}]
		</span>
	);
}
