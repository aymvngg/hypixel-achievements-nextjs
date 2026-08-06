import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import type { CompareApiResponse } from "@/lib/api/types";
import {
	correlateAchievements,
	fetchAchievements,
	fetchPlayer,
	toPublicPlayerData,
} from "@/lib/hypixel/api";
import {
	computeCompare,
	computeCompareVerdict,
	sortCompareRows,
	type CompareMetric,
} from "@/lib/logic/compare";
import { getDisplayName, shortName } from "@/lib/util/display";
import { validatePlayerQuery } from "@/lib/util/validate";

export async function getComparePageData(
	p1: string,
	p2: string,
	metric: CompareMetric = "obtained",
): Promise<CompareApiResponse> {
	"use cache: remote";
	cacheLife("hypixelPlayer");

	const p1Query = validatePlayerQuery(p1);
	const p2Query = validatePlayerQuery(p2);

	if (p1Query.toLowerCase() === p2Query.toLowerCase()) {
		throw new Error("Players must be different");
	}

	const [catalog, player1, player2] = await Promise.all([
		fetchAchievements(),
		fetchPlayer(p1Query),
		fetchPlayer(p2Query),
	]);

	cacheTag(`player:${player1.uuid}`, `player:${player2.uuid}`);

	const p1Views = correlateAchievements(
		catalog.achievements,
		player1,
		catalog.legacyKeys,
	);
	const p2Views = correlateAchievements(
		catalog.achievements,
		player2,
		catalog.legacyKeys,
	);
	const result = computeCompare(p1Views, p2Views);
	const sortedRows = sortCompareRows(result.rows, metric);

	const p1Name = getDisplayName(player1, p1Query);
	const p2Name = getDisplayName(player2, p2Query);

	return {
		p1: toPublicPlayerData(player1),
		p2: toPublicPlayerData(player2),
		p1Name,
		p2Name,
		result: { ...result, rows: sortedRows },
		metric,
		verdict: computeCompareVerdict(
			result,
			shortName(p1Name),
			shortName(p2Name),
		),
	};
}
