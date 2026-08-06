import type { AchievementView, PublicPlayerData } from "@/lib/hypixel/types";
import type { CompareResult, CompareMetric } from "@/lib/logic/compare";

export interface PlayerApiResponse {
	player: PublicPlayerData;
	views: AchievementView[];
	games: string[];
}

export interface CompareApiResponse {
	p1: PublicPlayerData;
	p2: PublicPlayerData;
	p1Name: string;
	p2Name: string;
	result: CompareResult;
	metric: CompareMetric;
	verdict: string;
}
