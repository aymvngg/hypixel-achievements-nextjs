'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPlayerData } from '@/lib/api/client';
import { queryKeys, STALE_TIME_PLAYER } from '@/lib/queries/keys';

export function usePlayerData(username: string) {
  return useQuery({
    queryKey: queryKeys.player(username),
    queryFn: () => fetchPlayerData(username),
    staleTime: STALE_TIME_PLAYER,
    enabled: username.length > 0,
  });
}
