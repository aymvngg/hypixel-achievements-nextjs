import type { AchievementView } from "@/lib/hypixel/types";

export type BreakdownMetric = "obtained" | "missing";

export interface GameBreakdownRow {
	game: string;
	obtained: number;
	missing: number;
	total: number;
	completed: number;
	count: number;
}

export function computeGameBreakdown(
	views: AchievementView[],
): GameBreakdownRow[] {
	const byGame = new Map<string, GameBreakdownRow>();

	for (const view of views) {
		let row = byGame.get(view.game);
		if (!row) {
			row = {
				game: view.game,
				obtained: 0,
				missing: 0,
				total: 0,
				completed: 0,
				count: 0,
			};
			byGame.set(view.game, row);
		}

		row.obtained += view.obtainedPoints;
		row.total += view.totalPoints;
		row.missing += view.totalPoints - view.obtainedPoints;
		row.count += 1;
		if (view.completed) row.completed += 1;
	}

	return [...byGame.values()];
}

export function sortGameBreakdown(
	rows: GameBreakdownRow[],
	metric: BreakdownMetric,
): GameBreakdownRow[] {
	return [...rows].sort((a, b) => {
		const aValue = metric === "obtained" ? a.obtained : a.missing;
		const bValue = metric === "obtained" ? b.obtained : b.missing;
		if (bValue !== aValue) return bValue - aValue;
		return a.game.localeCompare(b.game);
	});
}
