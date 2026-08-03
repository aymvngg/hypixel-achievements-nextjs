import type { AchievementView, PlayerData } from '@/lib/hypixel/types';
import type { CompareResult } from '@/lib/logic/compare';
import type { CompareMetric } from '@/lib/logic/compare';

export interface CacheMeta {
  achievementsHit: boolean;
  playerHit: boolean;
}

export interface PlayerApiResponse {
  player: PlayerData;
  views: AchievementView[];
  games: string[];
  cache: CacheMeta;
}

export interface CompareApiResponse {
  p1: PlayerData;
  p2: PlayerData;
  p1Name: string;
  p2Name: string;
  result: CompareResult;
  metric: CompareMetric;
  verdict: string;
  cache: {
    achievementsHit: boolean;
    p1Hit: boolean;
    p2Hit: boolean;
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = typeof body.error === 'string' ? body.error : res.statusText;
    throw new ApiError(message, res.status);
  }
  return res.json() as Promise<T>;
}

export async function fetchPlayerData(username: string): Promise<PlayerApiResponse> {
  const res = await fetch(`/api/player/${encodeURIComponent(username)}`);
  return parseJson<PlayerApiResponse>(res);
}

export async function fetchCompare(
  p1: string,
  p2: string,
  metric: CompareMetric,
): Promise<CompareApiResponse> {
  const params = new URLSearchParams({ p1, p2, metric });
  const res = await fetch(`/api/compare?${params}`);
  return parseJson<CompareApiResponse>(res);
}
