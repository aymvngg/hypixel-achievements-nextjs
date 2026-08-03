import type { CompareMetric } from '@/lib/logic/compare';

export const queryKeys = {
  all: ['hypixel'] as const,
  player: (username: string) => [...queryKeys.all, 'player', username] as const,
  compare: (p1: string, p2: string, metric: CompareMetric) =>
    [...queryKeys.all, 'compare', p1, p2, metric] as const,
};

export const STALE_TIME_PLAYER = 5 * 60 * 1000;
export const STALE_TIME_COMPARE = 5 * 60 * 1000;
