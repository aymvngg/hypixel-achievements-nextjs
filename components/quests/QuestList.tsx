import type { QuestView } from "@/lib/hypixel/types";
import { QuestCard } from "@/components/quests/QuestCard";

const PF = "font-[family-name:var(--font-pixel)]";

function QuestTypeSection({
	title,
	accent,
	quests,
	id,
	showGameOnCard,
	hideTypeOnCard,
}: {
	title: string;
	accent: string;
	quests: QuestView[];
	id: string;
	showGameOnCard: boolean;
	hideTypeOnCard: boolean;
}) {
	if (quests.length === 0) return null;

	const completed = quests.filter((q) => q.status === "completed").length;

	return (
		<section className="flex flex-col gap-3" id={id}>
			<div className="flex items-center justify-between gap-3 px-0.5">
				<div className="flex items-center gap-2">
					<span className={`w-1.5 h-5 ${accent}`} aria-hidden />
					<h2 className={`${PF} text-base tracking-[0.06em] text-mc-sky`}>
						{title}
					</h2>
				</div>
				<span
					className={`${PF} text-[0.7rem] tracking-[0.04em] uppercase text-mc-stone-light px-2 py-0.5 rounded-sm border-2 border-mc-border bg-mc-stone-dark`}
				>
					{completed}/{quests.length}
				</span>
			</div>
			<div className="flex flex-col gap-3">
				{quests.map((quest) => (
					<QuestCard
						key={quest.questId}
						quest={quest}
						showGame={showGameOnCard}
						hideType={hideTypeOnCard}
					/>
				))}
			</div>
		</section>
	);
}

function FlatQuestList({
	quests,
	showGameOnCard,
	hideTypeOnCard,
}: {
	quests: QuestView[];
	showGameOnCard: boolean;
	hideTypeOnCard: boolean;
}) {
	return (
		<div className="flex flex-col gap-3">
			{quests.map((quest) => (
				<QuestCard
					key={quest.questId}
					quest={quest}
					showGame={showGameOnCard}
					hideType={hideTypeOnCard}
				/>
			))}
		</div>
	);
}

export function QuestList({
	quests,
	groupByType,
	showGameOnCard,
}: {
	quests: QuestView[];
	groupByType: boolean;
	showGameOnCard: boolean;
}) {
	if (quests.length === 0) {
		return (
			<div
				className="text-center py-12 text-mc-stone-light font-[family-name:var(--font-pixel)] text-sm"
			>
				No quests match your filters.
			</div>
		);
	}

	if (!groupByType) {
		return (
			<FlatQuestList
				quests={quests}
				showGameOnCard={showGameOnCard}
				hideTypeOnCard={false}
			/>
		);
	}

	const daily = quests.filter((q) => q.type === "DAILY");
	const weekly = quests.filter((q) => q.type === "WEEKLY");
	const monthly = quests.filter((q) => q.type === "MONTHLY");

	return (
		<div className="space-y-6">
			<QuestTypeSection
				title="Daily Quests"
				accent="bg-mc-gold"
				quests={daily}
				id="quests-daily"
				showGameOnCard={showGameOnCard}
				hideTypeOnCard
			/>
			<QuestTypeSection
				title="Weekly Quests"
				accent="bg-mc-sky"
				quests={weekly}
				id="quests-weekly"
				showGameOnCard={showGameOnCard}
				hideTypeOnCard
			/>
			<QuestTypeSection
				title="Monthly Quests"
				accent="bg-mc-purple"
				quests={monthly}
				id="quests-monthly"
				showGameOnCard={showGameOnCard}
				hideTypeOnCard
			/>
		</div>
	);
}
