'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePlayerData } from '@/lib/queries/use-player-data';
import { recomputeViews } from '@/lib/util/filters';
import { parseAchievementSearchParams, PAGE_SIZE } from '@/lib/search-params';
import { PlayerHeader } from '@/components/player/PlayerHeader';
import { PlayerNav } from '@/components/layout/PlayerNav';
import { AchievementFilters } from '@/components/achievements/AchievementFilters';
import { AchievementList } from '@/components/achievements/AchievementList';
import { Pagination } from '@/components/achievements/Pagination';
import { BlockPanel } from '@/components/ui/BlockPanel';

function AchievementsContent({ username }: { username: string }) {
  const searchParams = useSearchParams();
  const params = parseAchievementSearchParams({
    game: searchParams.get('game') ?? undefined,
    type: searchParams.get('type') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
    desc: searchParams.get('desc') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    debug: searchParams.get('debug') ?? undefined,
  });

  const { data, isLoading, error } = usePlayerData(username);

  if (isLoading) {
    return <BlockPanel className="text-center py-12 text-mc-sky">Loading achievements...</BlockPanel>;
  }

  if (error) {
    return (
      <BlockPanel className="text-center py-12 text-mc-red">
        {error instanceof Error ? error.message : 'Failed to load player'}
      </BlockPanel>
    );
  }

  if (!data) return null;

  const filtered = recomputeViews(data.views, {
    search: params.search,
    game: params.game,
    type: params.type,
    status: params.status,
    sortField: params.sort,
    sortDesc: params.desc,
  });

  const page = params.page ?? 1;
  const start = (page - 1) * PAGE_SIZE;
  const pageViews = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="space-y-4">
      <PlayerHeader
        player={data.player}
        query={username}
        views={data.views}
        cache={data.cache}
        showDebug={params.debug}
      />
      <PlayerNav username={username} />
      <AchievementFilters games={data.games} params={params} />
      <p className="text-sm text-mc-stone-light font-[family-name:var(--font-pixel)]">
        Showing {pageViews.length} of {filtered.length} achievements
      </p>
      <AchievementList views={pageViews} />
      <Pagination total={filtered.length} params={params} />
    </div>
  );
}

export function AchievementsPage({ username }: { username: string }) {
  return (
    <Suspense fallback={<BlockPanel className="text-center py-12">Loading...</BlockPanel>}>
      <AchievementsContent username={username} />
    </Suspense>
  );
}
