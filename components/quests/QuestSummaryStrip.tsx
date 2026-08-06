import type { QuestSummary } from "@/lib/logic/quest-stats";
import {
	formatResetIn,
	msUntilReset,
} from "@/lib/util/quest-resets";
import { BlockPanel } from "@/components/ui/BlockPanel";

const PF = "font-[family-name:var(--font-pixel)]";

function TypeCard({
	label,
	summary,
	resetMs,
	accent,
}: {
	label: string;
	summary: { total: number; completed: number; active: number };
	resetMs: number;
	accent: string;
}) {
	return (
		<div
			className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-sm border-2 border-mc-border bg-mc-stone-dark shadow-[inset_1px_1px_3px_rgba(0,0,0,0.35)] min-w-[7rem]"
		>
			<span
				className={`text-[0.6rem] ${PF} uppercase tracking-wider ${accent}`}
			>
				{label}
			</span>
			<span className={`${PF} text-sm`}>
				<span className="text-mc-grass font-bold">
					{summary.completed}
				</span>
				<span className="text-mc-stone-light">
					{" "}
					/ {summary.total}
				</span>
			</span>
			{summary.active > 0 && (
				<span className={`text-[0.55rem] ${PF} text-mc-sky`}>
					{summary.active} active
				</span>
			)}
			<span className={`text-[0.55rem] ${PF} text-mc-stone-light`}>
				Resets in {formatResetIn(resetMs)}
			</span>
		</div>
	);
}

export function QuestSummaryStrip({ summary }: { summary: QuestSummary }) {
	const pct =
		summary.total > 0
			? ((summary.completed / summary.total) * 100).toFixed(1)
			: "0.0";
	const pctNum =
		summary.total > 0 ? (summary.completed / summary.total) * 100 : 0;

	return (
		<BlockPanel variant="elevated" className="space-y-3">
			<div className="flex flex-wrap gap-3 justify-center sm:justify-start">
				<TypeCard
					label="Daily"
					summary={summary.byType.DAILY}
					resetMs={msUntilReset("DAILY")}
					accent="text-mc-gold"
				/>
				<TypeCard
					label="Weekly"
					summary={summary.byType.WEEKLY}
					resetMs={msUntilReset("WEEKLY")}
					accent="text-mc-sky"
				/>
				<TypeCard
					label="Monthly"
					summary={summary.byType.MONTHLY}
					resetMs={msUntilReset("MONTHLY")}
					accent="text-mc-purple"
				/>
				<div
					className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-sm border-2 border-mc-border bg-mc-stone-dark shadow-[inset_1px_1px_3px_rgba(0,0,0,0.35)]"
				>
					<span
						className={`text-[0.6rem] ${PF} uppercase text-mc-stone-light tracking-wider`}
					>
						Period Progress
					</span>
					<span className={`${PF} text-lg text-mc-grass font-bold`}>
						{pct}%
					</span>
					<span className={`text-[0.55rem] ${PF} text-mc-stone-light`}>
						{summary.completed} / {summary.total} quests
					</span>
				</div>
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
