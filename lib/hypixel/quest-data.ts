import "server-only";

import { cacheLife, cacheTag } from "next/cache";
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

export async function getPlayerQuestPageData(
	query: string,
): Promise<QuestPageData> {
	"use cache: remote";
	cacheLife("hypixelPlayer");

	const [questDefs, player] = await Promise.all([
		fetchQuests(),
		fetchPlayer(query),
	]);

	cacheTag(`player:${player.uuid}`);

	const views = correlateQuests(questDefs, player.quests);

	return {
		player: toPublicPlayerData(player),
		views,
		games: getQuestGameNames(views),
	};
}
