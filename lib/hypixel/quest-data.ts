import "server-only";

import { cache } from "react";
import type { PublicPlayerData, QuestView } from "@/lib/hypixel/types";
import {
	fetchGameCounts,
	fetchPlayer,
	fetchQuests,
	toPublicPlayerData,
} from "@/lib/hypixel/api";
import {
	correlateQuests,
	getQuestGameNames,
} from "@/lib/hypixel/correlate-quests";
import {
	mapCountsModesToUiGames,
	mapCountsToUiGames,
} from "@/lib/util/gamecounts";

export interface QuestPageData {
	player: PublicPlayerData;
	views: QuestView[];
	games: string[];
	/** Per-gamemode live player counts, keyed by UI game id. Omitted when the
	 * counts endpoint is unavailable so the UI degrades gracefully. */
	counts?: Record<string, number>;
	/** Per-mode live player counts, keyed by UI game id and raw mode id. */
	modeCounts?: Record<string, Record<string, number>>;
	/** Total players on the Hypixel network. */
	totalPlayers?: number;
}

export const getPlayerQuestPageData = cache(
	async (query: string, ip: string): Promise<QuestPageData> => {
		const [questDefs, player, countsResult] = await Promise.all([
			fetchQuests(ip),
			fetchPlayer(query, ip),
			fetchGameCounts().then(
				(raw) => ({ ok: true as const, raw }),
				(err) => ({ ok: false as const, err }),
			),
		]);

		const views = correlateQuests(questDefs, player.quests);

		const data: QuestPageData = {
			player: toPublicPlayerData(player),
			views,
			games: getQuestGameNames(views),
		};

		if (countsResult.ok) {
			data.counts = mapCountsToUiGames(countsResult.raw);
			data.modeCounts = mapCountsModesToUiGames(countsResult.raw);
			data.totalPlayers = countsResult.raw.playerCount;
		}

		return data;
	},
);
