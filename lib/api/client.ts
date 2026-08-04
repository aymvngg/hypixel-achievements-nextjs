import type { CompareMetric } from '@/lib/logic/compare';
import type { CompareApiResponse, PlayerApiResponse } from '@/lib/api/types';

export type { CompareApiResponse, PlayerApiResponse };

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
