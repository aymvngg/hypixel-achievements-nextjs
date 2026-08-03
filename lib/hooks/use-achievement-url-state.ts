'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  buildAchievementSearchParams,
  parseAchievementSearchParams,
  type AchievementSearchParams,
} from '@/lib/search-params';

/**
 * Achievement filters are applied client-side on cached player data.
 * URL query params are kept in sync for shareable links (replace, no scroll).
 */
export function useAchievementUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = useMemo(
    () =>
      parseAchievementSearchParams({
        game: searchParams.get('game') ?? undefined,
        type: searchParams.get('type') ?? undefined,
        status: searchParams.get('status') ?? undefined,
        sort: searchParams.get('sort') ?? undefined,
        desc: searchParams.get('desc') ?? undefined,
        search: searchParams.get('search') ?? undefined,
        debug: searchParams.get('debug') ?? undefined,
      }),
    [searchParams],
  );

  const setParams = useCallback(
    (updates: Partial<AchievementSearchParams>) => {
      const next = buildAchievementSearchParams(params, updates);
      const qs = next.toString();
      const href = qs ? `${pathname}?${qs}` : pathname;
      router.replace(href, { scroll: false });
    },
    [params, pathname, router],
  );

  const clearParams = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  return { params, setParams, clearParams };
}
