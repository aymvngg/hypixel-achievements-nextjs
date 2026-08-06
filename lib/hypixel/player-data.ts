import "server-only";

import { cacheLife, cacheTag } from "next/cache";
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
): Promise<PlayerApiResponse> {
	"use cache: remote";
	cacheLife("hypixelPlayer");

	const [achievements, player] = await Promise.all([
		fetchAchievements(),
		fetchPlayer(query),
	]);

	cacheTag(`player:${player.uuid}`);

	return {
		player: toPublicPlayerData(player),
		views: correlateAchievements(achievements, player),
		games: getGameNames(achievements),
	};
}
