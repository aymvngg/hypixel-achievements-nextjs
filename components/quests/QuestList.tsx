import type { QuestView } from "@/lib/hypixel/types";
import { QuestCard } from "@/components/quests/QuestCard";

export function QuestList({
	quests,
	showGameOnCard,
}: {
	quests: QuestView[];
	showGameOnCard: boolean;
}) {
	if (quests.length === 0) {
		return (
			<div className="text-center py-12 text-mc-stone-light font-[family-name:var(--font-pixel)] text-sm">
				No quests match your filters.
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			{quests.map((quest) => (
				<QuestCard
					key={quest.questId}
					quest={quest}
					showGame={showGameOnCard}
				/>
			))}
		</div>
	);
}
