import type { PlayerAchievementSummary } from "@/lib/logic/achievement-stats";
import { BlockPanel } from "@/components/ui/BlockPanel";

const PF = "font-[family-name:var(--font-pixel)]";

function StatCard({
	label,
	children,
	accent,
}: {
	label: string;
	children: React.ReactNode;
	accent: string;
}) {
	return (
		<div className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-sm border-2 border-mc-border bg-mc-stone-dark shadow-[inset_1px_1px_3px_rgba(0,0,0,0.35)] flex-1 min-w-0">
			<span
				className={`text-[0.6rem] ${PF} uppercase tracking-wider ${accent}`}
			>
				{label}
			</span>
			{children}
		</div>
	);
}

export function AchievementSummaryStrip({
	summary,
}: {
	summary: PlayerAchievementSummary;
}) {
	const { obtained, total, completedCount, totalCount } = summary;
	const pct = total > 0 ? ((obtained / total) * 100).toFixed(1) : "0.0";
	const pctNum = total > 0 ? (obtained / total) * 100 : 0;

	return (
		<BlockPanel variant="elevated" className="space-y-3">
			<div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3 sm:justify-start">
				<StatCard label="Achievement Points" accent="text-mc-stone-light">
					<span className={`${PF} text-sm`}>
						<span className="text-mc-grass font-bold">
							{obtained.toLocaleString()}
						</span>
						<span className="text-mc-stone-light">
							{" "}
							/ {total.toLocaleString()}
						</span>
					</span>
				</StatCard>

				<StatCard label="Completion" accent="text-mc-stone-light">
					<span className={`${PF} text-lg text-mc-sky font-bold`}>
						{pct}%
					</span>
				</StatCard>

				<StatCard label="Completed" accent="text-mc-stone-light">
					<span className={`${PF} text-sm`}>
						<span className="text-mc-grass font-bold">
							{completedCount}
						</span>
						<span className="text-mc-stone-light">
							{" "}
							/ {totalCount}
						</span>
					</span>
				</StatCard>
			</div>
			<div className="rounded-sm h-2.5 overflow-hidden border-[3px] border-mc-border bg-mc-stone-dark shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_0_rgba(255,255,255,0.05)]">
				<div
					className="h-full bg-mc-grass"
					style={{ width: `${Math.min(100, pctNum)}%` }}
				/>
			</div>
		</BlockPanel>
	);
}
