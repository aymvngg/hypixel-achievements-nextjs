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
  /** Next tier goal shown in the description (tiered only). */
  tierTarget: number;
  /** Progress toward the next tier goal, 0–1 (1 when max tier reached). */
  tierProgress: number;
}

export interface PlayerData {
  uuid: string;
  nickname: string;
  rank: string | null;
  /** Hex color for MVP+/MVP++ plus sign (rankPlusColor). */
  rankPlusColor: string | null;
  /** Hex color for MVP++ monthly prefix (monthlyRankColor). */
  rankPrefixColor: string | null;
  achievementPoints: number;
  tieredAchievements: Record<string, number>;
  oneTimeAchievements: string[];
}

/** The player fields required by the browser UI. Keep achievement state server-only. */
export interface PublicPlayerData {
  uuid: string;
  nickname: string;
  rank: string | null;
  rankPlusColor: string | null;
  rankPrefixColor: string | null;
}

export function toPublicPlayerData(player: PlayerData): PublicPlayerData {
  return {
    uuid: player.uuid,
    nickname: player.nickname,
    rank: player.rank,
    rankPlusColor: player.rankPlusColor,
    rankPrefixColor: player.rankPrefixColor,
  };
}

export function sumObtainedPoints(views: AchievementView[]): number {
  return views.reduce((sum, v) => sum + v.obtainedPoints, 0);
}
