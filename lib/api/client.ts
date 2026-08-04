import type { AchievementView } from '@/lib/hypixel/types';
import type { CompareResult } from '@/lib/logic/compare';
import type { CompareMetric } from '@/lib/logic/compare';
import type { PublicPlayerData } from '@/lib/hypixel/types';

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

export async function fetchPlayerData(
  username: string,
  signal?: AbortSignal,
): Promise<PlayerApiResponse> {
  const res = await fetch(`/api/player/${encodeURIComponent(username)}`, { signal });
  return parseJson<PlayerApiResponse>(res);
}

export async function fetchCompare(
  p1: string,
  p2: string,
  metric: CompareMetric,
  signal?: AbortSignal,
): Promise<CompareApiResponse> {
  const params = new URLSearchParams({ p1, p2, metric });
  const res = await fetch(`/api/compare?${params}`, { signal });
  return parseJson<CompareApiResponse>(res);
}
