import type { QuestResetType, QuestStatus, QuestView } from "@/lib/hypixel/types";
import { formatQuestReward } from "@/lib/util/quest-rewards";
import { formatGameLabel, gameIconUrl } from "@/lib/util/games";
import { PixelImg } from "@/components/ui/PixelImg";
import { PixelIcon } from "@/components/ui/PixelIcon";

const PF = "font-[family-name:var(--font-pixel)]";

const PANEL_SHADOW =
	"shadow-[inset_2px_2px_0_rgba(255,255,255,0.07),inset_-1px_-1px_0_rgba(0,0,0,0.2),3px_3px_0_rgba(0,0,0,0.35)]";

const BAR_TRACK =
	"rounded-sm overflow-hidden border-2 border-mc-border bg-black/50 shadow-[inset_2px_2px_3px_rgba(0,0,0,0.45)]";

const TYPE_META: Record<
	QuestResetType,
	{ label: string; strip: string; text: string }
> = {
	DAILY: {
		label: "Daily",
		strip: "bg-mc-gold",
		text: "text-mc-gold",
	},
	WEEKLY: {
		label: "Weekly",
		strip: "bg-mc-sky",
		text: "text-mc-sky",
	},
	MONTHLY: {
		label: "Monthly",
		strip: "bg-mc-purple",
		text: "text-mc-purple",
	},
};

const STATUS_META: Record<
	QuestStatus,
	{ label: string; dot: string; text: string }
> = {
	active: {
		label: "In progress",
		dot: "bg-mc-sky shadow-[0_0_6px_rgba(85,170,255,0.6)]",
		text: "text-mc-sky",
	},
	completed: {
		label: "Complete",
		dot: "bg-mc-grass",
		text: "text-mc-grass",
	},
	available: {
		label: "Not started",
		dot: "bg-mc-stone",
		text: "text-mc-stone-light",
	},
};

function aggregateCounts(quest: QuestView) {
	let progress = 0;
	let target = 0;
	for (const obj of quest.objectives) {
		progress += obj.progress;
		target += obj.target;
	}
	return { progress, target };
}

function ProgressBar({
	pct,
	completed,
	active,
	className = "h-2.5",
}: {
	pct: number;
	completed: boolean;
	active: boolean;
	className?: string;
}) {
	const fill =
		completed
			? "bg-mc-grass"
			: active
				? "bg-mc-sky"
				: pct > 0
					? "bg-mc-sky"
					: "bg-mc-stone";

	return (
		<div className={`${BAR_TRACK} ${className}`}>
			<div
				className={`h-full transition-[width] duration-300 ${fill}`}
				style={{ width: `${Math.min(100, pct)}%` }}
			/>
		</div>
	);
}

function ObjectiveList({
	objectives,
	description,
	multi,
}: {
	objectives: QuestView["objectives"];
	description: string;
	multi: boolean;
}) {
	const lines = description.split("\n").filter(Boolean);

	return (
		<ul className="space-y-2">
			{objectives.map((obj, index) => {
				const pct =
					obj.target > 0
						? Math.min(100, (obj.progress / obj.target) * 100)
						: 0;
				const label = lines[index] ?? obj.id;

				return (
					<li key={obj.id} className="flex gap-2 items-start">
						<span
							className={`mt-0.5 shrink-0 w-3.5 h-3.5 rounded-[2px] border-2 flex items-center justify-center ${
								obj.completed
									? "border-mc-grass bg-mc-grass/25 text-mc-grass"
									: "border-mc-border bg-mc-stone-dark"
							}`}
							aria-hidden
						>
							{obj.completed && (
								<PixelIcon name="check" className="h-2.5 w-2.5" />
							)}
						</span>
						<div className="flex-1 min-w-0 space-y-1">
							<div className="flex items-start justify-between gap-3 text-xs">
								<span
									className={`leading-snug ${
										obj.completed
											? "text-mc-stone-light"
											: "text-foreground/90"
									}`}
								>
									{label}
								</span>
								<span
									className={`${PF} text-[0.65rem] tabular-nums shrink-0 text-mc-stone-light`}
								>
									{obj.progress}/{obj.target}
								</span>
							</div>
							{multi && (
								<ProgressBar
									pct={pct}
									completed={obj.completed}
									active={pct > 0 && !obj.completed}
									className="h-1.5"
								/>
							)}
						</div>
					</li>
				);
			})}
		</ul>
	);
}

function RewardFooter({ rewards }: { rewards: QuestView["rewards"] }) {
	if (rewards.length === 0) return null;

	return (
		<footer className="mt-3 pt-2.5 border-t-2 border-dashed border-mc-border/50">
			<p
				className={`${PF} text-[0.6rem] uppercase tracking-[0.12em] text-mc-stone-light mb-1.5`}
			>
				Rewards
			</p>
			<div className="flex flex-wrap gap-1.5">
				{rewards.map((reward, index) => (
					<span
						key={`${reward.type}-${index}`}
						className={`${PF} text-[0.6rem] px-2 py-0.5 rounded-sm border-2 border-mc-border bg-mc-stone-dark text-mc-gold shadow-[inset_1px_1px_0_rgba(255,255,255,0.05)]`}
					>
						{formatQuestReward(reward.type, reward.amount)}
					</span>
				))}
			</div>
		</footer>
	);
}

export function QuestCard({
	quest,
	showGame,
	hideType,
}: {
	quest: QuestView;
	showGame?: boolean;
	/** Hide type label when quests are already grouped by period. */
	hideType?: boolean;
}) {
	const type = TYPE_META[quest.type];
	const status = STATUS_META[quest.status];
	const gameIcon = gameIconUrl(quest.game);
	const progressPct = Math.round(quest.progress * 100);
	const totals = aggregateCounts(quest);
	const multiObjective = quest.objectives.length > 1;
	const completed = quest.status === "completed";

	return (
		<article
			data-status={quest.status}
			className={`flex rounded-sm border-2 border-mc-border bg-mc-panel ${PANEL_SHADOW} ${
				completed
					? "ring-1 ring-mc-grass/30"
					: quest.status === "active"
						? "ring-1 ring-mc-sky/20"
						: ""
			}`}
		>
			<div
				className={`w-1 shrink-0 rounded-l-[1px] ${completed ? "bg-mc-grass" : type.strip}`}
				aria-hidden
			/>

			<div className="flex-1 min-w-0 p-3 sm:p-3.5">
				<header className="flex gap-2.5 sm:gap-3">
					{showGame && gameIcon && (
						<div
							className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-sm border-2 border-mc-border bg-mc-stone-dark shadow-[inset_2px_2px_3px_rgba(0,0,0,0.4)]"
						>
							<PixelImg
								src={gameIcon}
								alt=""
								width={32}
								height={32}
								className="shrink-0"
							/>
						</div>
					)}

					<div className="flex-1 min-w-0">
						<div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
							{!hideType && (
								<span
									className={`${PF} text-[0.6rem] uppercase tracking-wide ${type.text}`}
								>
									{type.label}
								</span>
							)}
							{showGame && (
								<span
									className={`${PF} text-[0.6rem] uppercase text-mc-stone-light`}
								>
									{formatGameLabel(quest.game)}
								</span>
							)}
							<span className="flex items-center gap-1.5">
								<span
									className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.dot}`}
									aria-hidden
								/>
								<span
									className={`${PF} text-[0.6rem] uppercase ${status.text}`}
								>
									{status.label}
								</span>
							</span>
						</div>

						<div className="flex items-start justify-between gap-3">
							<h3
								className={`${PF} text-sm sm:text-[0.95rem] text-foreground leading-snug tracking-[0.03em] min-w-0`}
							>
								{quest.name}
							</h3>
							<div className="shrink-0 text-right tabular-nums">
								<span
									className={`${PF} text-lg leading-none block ${
										completed
											? "text-mc-grass"
											: progressPct > 0
												? "text-mc-sky"
												: "text-mc-stone-light"
									}`}
								>
									{progressPct}%
								</span>
								<span
									className={`${PF} text-[0.6rem] text-mc-stone-light`}
								>
									{totals.progress}/{totals.target}
								</span>
							</div>
						</div>
					</div>
				</header>

				<div className="mt-2.5">
					<ProgressBar
						pct={progressPct}
						completed={completed}
						active={quest.status === "active"}
						className="h-2.5"
					/>
				</div>

				<div className="mt-3">
					<ObjectiveList
						objectives={quest.objectives}
						description={quest.description}
						multi={multiObjective}
					/>
				</div>

				<RewardFooter rewards={quest.rewards} />
			</div>
		</article>
	);
}
