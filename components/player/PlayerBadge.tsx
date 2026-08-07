import type { PlayerBadgeType } from "@/lib/util/special-players";

const STYLES: Record<PlayerBadgeType, { label: string; className: string }> = {
	owner: {
		label: "Owner",
		className: "bg-mc-gold/20 text-mc-gold border-mc-gold/40",
	},
	"early-tester": {
		label: "Early Tester",
		className: "bg-mc-sky/20 text-mc-sky border-mc-sky/40",
	},
	mommy: {
		label: "❤️ Mommy ❤️",
		className: "bg-[#ff69b4]/20 text-[#ff69b4] border-[#ff69b4]/50",
	},
	technoblade: {
		label: "Never Dies",
		className: "bg-[#2a0f2a]/80 text-[#ff55ff] border-[#ff55ff]/50",
	},
};

export function PlayerBadge({ type }: { type: PlayerBadgeType }) {
	const { label, className } = STYLES[type];
	return (
		<span
			className={`inline-flex items-center px-1.5 py-0.5 text-[0.6rem] font-[family-name:var(--font-pixel)] uppercase tracking-wide border rounded-sm align-middle ${className}`}
			title={label}
		>
			{label}
		</span>
	);
}
