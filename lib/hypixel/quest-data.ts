import "server-only";

import { cache } from "react";
import type { PublicPlayerData, QuestView } from "@/lib/hypixel/types";
import {
	fetchPlayer,
	fetchQuests,
	toPublicPlayerData,
} from "@/lib/hypixel/api";
import {
	correlateQuests,
	getQuestGameNames,
} from "@/lib/hypixel/correlate-quests";

export interface QuestPageData {
	player: PublicPlayerData;
	views: QuestView[];
	games: string[];
}

export const getPlayerQuestPageData = cache(
	async (query: string): Promise<QuestPageData> => {
		const [questDefs, player] = await Promise.all([
			fetchQuests(),
			fetchPlayer(query),
		]);

		const views = correlateQuests(questDefs, player.quests);

		return {
			player: toPublicPlayerData(player),
			views,
			games: getQuestGameNames(views),
		};
	},
);
