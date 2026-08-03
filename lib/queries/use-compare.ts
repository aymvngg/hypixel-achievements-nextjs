'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCompare } from '@/lib/api/client';
import type { CompareMetric } from '@/lib/logic/compare';
import { queryKeys, STALE_TIME_COMPARE } from '@/lib/queries/keys';

export function useCompare(p1: string, p2: string, metric: CompareMetric) {
  return useQuery({
    queryKey: queryKeys.compare(p1, p2, metric),
    queryFn: () => fetchCompare(p1, p2, metric),
    staleTime: STALE_TIME_COMPARE,
    enabled: p1.length > 0 && p2.length > 0 && p1.toLowerCase() !== p2.toLowerCase(),
  });
}
