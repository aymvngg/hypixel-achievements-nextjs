import type { AchievementView } from '@/lib/hypixel/types';

/** Compact tuple encoding for client transport — order is stable. */
export type CompactAchievementView = [
  game: string,
  codeName: string,
  name: string,
  description: string,
  type: 0 | 1,
  completed: 0 | 1,
  points: number,
  obtainedPoints: number,
  totalPoints: number,
  gamePercentUnlocked: number,
  globalPercentUnlocked: number,
  currentTier: number,
  maxTier: number,
  progress: number,
  tierProgress: number,
];

export function toCompactView(view: AchievementView): CompactAchievementView {
  return [
    view.game,
    view.codeName,
    view.name,
    view.description,
    view.type === 'TIERED' ? 1 : 0,
    view.completed ? 1 : 0,
    view.points,
    view.obtainedPoints,
    view.totalPoints,
    view.gamePercentUnlocked,
    view.globalPercentUnlocked,
    view.currentTier,
    view.maxTier,
    view.progress,
    view.tierProgress,
  ];
}

export function fromCompactView(row: CompactAchievementView): AchievementView {
  return {
    game: row[0],
    codeName: row[1],
    name: row[2],
    description: row[3],
    type: row[4] ? 'TIERED' : 'ONE_TIME',
    completed: row[5] === 1,
    points: row[6],
    obtainedPoints: row[7],
    totalPoints: row[8],
    gamePercentUnlocked: row[9],
    globalPercentUnlocked: row[10],
    currentTier: row[11],
    maxTier: row[12],
    progress: row[13],
    tierProgress: row[14],
    tierTarget: 0,
  };
}

export function toCompactViews(views: AchievementView[]): CompactAchievementView[] {
  return views.map(toCompactView);
}

export function fromCompactViews(rows: CompactAchievementView[]): AchievementView[] {
  return rows.map(fromCompactView);
}
