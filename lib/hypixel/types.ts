export interface AchievementView {
  game: string;
  codeName: string;
  name: string;
  description: string;
  type: 'ONE_TIME' | 'TIERED';
  completed: boolean;
  points: number;
  obtainedPoints: number;
  totalPoints: number;
  gamePercentUnlocked: number;
  globalPercentUnlocked: number;
  currentTier: number;
  maxTier: number;
  progress: number;
}

export interface PlayerData {
  uuid: string;
  nickname: string;
  rank: string | null;
  achievementPoints: number;
  tieredAchievements: Record<string, number>;
  oneTimeAchievements: string[];
}

export function sumObtainedPoints(views: AchievementView[]): number {
  return views.reduce((sum, v) => sum + v.obtainedPoints, 0);
}
