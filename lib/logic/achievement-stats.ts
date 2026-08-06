import type { AchievementView } from '@/lib/hypixel/types';

export interface GameStat {
  count: number;
  obtained: number;
  total: number;
  completed: number;
}

export interface PlayerAchievementSummary {
  obtained: number;
  total: number;
  completedCount: number;
  totalCount: number;
}

export function summarizeAchievementViews(views: AchievementView[]): PlayerAchievementSummary {
  let obtained = 0;
  let total = 0;
  let completedCount = 0;

  for (const view of views) {
    obtained += view.obtainedPoints;
    total += view.totalPoints;
    if (view.completed) completedCount++;
  }

  return { obtained, total, completedCount, totalCount: views.length };
}

export function computeGameStats(views: AchievementView[]): {
  gameStats: Record<string, GameStat>;
  totalStat: GameStat;
} {
  const gameStats: Record<string, GameStat> = {};
  const totalStat: GameStat = { count: 0, obtained: 0, total: 0, completed: 0 };

  for (const view of views) {
    const stat = gameStats[view.game] ?? (gameStats[view.game] = { count: 0, obtained: 0, total: 0, completed: 0 });
    stat.count++;
    stat.obtained += view.obtainedPoints;
    stat.total += view.totalPoints;
    if (view.completed) stat.completed++;

    totalStat.count++;
    totalStat.obtained += view.obtainedPoints;
    totalStat.total += view.totalPoints;
    if (view.completed) totalStat.completed++;
  }

  return { gameStats, totalStat };
}

export function splitViewsByType(views: AchievementView[]): {
  tiered: AchievementView[];
  oneTime: AchievementView[];
} {
  const tiered: AchievementView[] = [];
  const oneTime: AchievementView[] = [];
  for (const view of views) {
    if (view.type === 'TIERED') tiered.push(view);
    else oneTime.push(view);
  }
  return { tiered, oneTime };
}
