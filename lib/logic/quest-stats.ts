import type { QuestResetType, QuestView } from "@/lib/hypixel/types";
import type { GameStat } from "@/lib/logic/achievement-stats";

export interface QuestTypeSummary {
	total: number;
	completed: number;
	active: number;
}

export interface QuestSummary {
	total: number;
	completed: number;
	active: number;
	byType: Record<QuestResetType, QuestTypeSummary>;
}

export function summarizeQuestViews(views: QuestView[]): QuestSummary {
	const byType: Record<QuestResetType, QuestTypeSummary> = {
		DAILY: { total: 0, completed: 0, active: 0 },
		WEEKLY: { total: 0, completed: 0, active: 0 },
		MONTHLY: { total: 0, completed: 0, active: 0 },
	};

	let completed = 0;
	let active = 0;

	for (const view of views) {
		const bucket = byType[view.type];
		bucket.total++;
		if (view.status === "completed") {
			completed++;
			bucket.completed++;
		} else if (view.status === "active") {
			active++;
			bucket.active++;
		}
	}

	return {
		total: views.length,
		completed,
		active,
		byType,
	};
}

export function computeQuestGameStats(views: QuestView[]): {
	gameStats: Record<string, GameStat>;
	totalStat: GameStat;
} {
	const gameStats: Record<string, GameStat> = {};
	const totalStat: GameStat = {
		count: 0,
		obtained: 0,
		total: 0,
		completed: 0,
	};

	for (const view of views) {
		const stat =
			gameStats[view.game] ??
			(gameStats[view.game] = {
				count: 0,
				obtained: 0,
				total: 0,
				completed: 0,
			});
		stat.count++;
		stat.total++;
		if (view.status === "completed") {
			stat.completed++;
			stat.obtained++;
		}

		totalStat.count++;
		totalStat.total++;
		if (view.status === "completed") {
			totalStat.completed++;
			totalStat.obtained++;
		}
	}

	return { gameStats, totalStat };
}

export function splitViewsByQuestType(views: QuestView[]): {
	daily: QuestView[];
	weekly: QuestView[];
	monthly: QuestView[];
} {
	const daily: QuestView[] = [];
	const weekly: QuestView[] = [];
	const monthly: QuestView[] = [];

	for (const view of views) {
		if (view.type === "DAILY") daily.push(view);
		else if (view.type === "WEEKLY") weekly.push(view);
		else monthly.push(view);
	}

	return { daily, weekly, monthly };
}

export function groupViewsByGame(views: QuestView[]): Map<string, QuestView[]> {
	const map = new Map<string, QuestView[]>();
	for (const view of views) {
		const list = map.get(view.game) ?? [];
		list.push(view);
		map.set(view.game, list);
	}
	return map;
}
