import "server-only";

import type { PlayerApiResponse } from "@/lib/api/types";
import {
	correlateAchievements,
	fetchAchievements,
	fetchPlayer,
	getGameNames,
	toPublicPlayerData,
} from "@/lib/hypixel/api";

export async function getPlayerPageData(
	query: string,
	ip: string,
): Promise<PlayerApiResponse> {
	const [catalog, player] = await Promise.all([
		fetchAchievements(ip),
		fetchPlayer(query, ip),
	]);

	return {
		player: toPublicPlayerData(player),
		views: correlateAchievements(
			catalog.achievements,
			player,
			catalog.legacyKeys,
		),
		games: getGameNames(catalog.achievements),
	};
}
