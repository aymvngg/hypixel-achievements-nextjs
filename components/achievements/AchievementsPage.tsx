'use client';

import { Suspense, useMemo } from 'react';
import { usePlayerData } from '@/lib/queries/use-player-data';
import { useAchievementUrlState } from '@/lib/hooks/use-achievement-url-state';
import { recomputeViews } from '@/lib/util/filters';
import { PlayerHeader } from '@/components/player/PlayerHeader';
import { PlayerNav } from '@/components/layout/PlayerNav';
import { GameSidebar, type GameStat } from '@/components/achievements/GameSidebar';
import { AchievementFilters } from '@/components/achievements/AchievementFilters';
import { AchievementTables } from '@/components/achievements/AchievementTables';
import { BlockPanel } from '@/components/ui/BlockPanel';
import { Loading } from '@/components/ui/Loading';

function AchievementsContent({ username }: { username: string }) {
  const { params, setParams, clearParams } = useAchievementUrlState();
  const { data, isLoading, error } = usePlayerData(username);

  const { tieredFiltered, oneTimeFiltered } = useMemo(() => {
    if (!data) return { tieredFiltered: [], oneTimeFiltered: [] };
    const filtered = recomputeViews(data.views, {
      search: params.search,
      game: params.game,
      type: params.type,
      status: params.status,
      sortField: params.sort,
      sortDesc: params.desc,
    });

    const tieredFiltered = [];
    const oneTimeFiltered = [];
    for (const view of filtered) {
      if (view.type === 'TIERED') tieredFiltered.push(view);
      else oneTimeFiltered.push(view);
    }
    return { tieredFiltered, oneTimeFiltered };
  }, [
    data,
    params.search,
    params.game,
    params.type,
    params.status,
    params.sort,
    params.desc,
  ]);

  const { gameStats, totalStat } = useMemo(() => {
    const nextGameStats: Record<string, GameStat> = {};
    const nextTotalStat: GameStat = { count: 0, obtained: 0, total: 0, completed: 0 };
    for (const view of data?.views ?? []) {
      const stat = nextGameStats[view.game] ?? (nextGameStats[view.game] = { count: 0, obtained: 0, total: 0, completed: 0 });
      stat.count++;
      stat.obtained += view.obtainedPoints;
      stat.total += view.totalPoints;
      if (view.completed) stat.completed++;
      nextTotalStat.count++;
      nextTotalStat.obtained += view.obtainedPoints;
      nextTotalStat.total += view.totalPoints;
      if (view.completed) nextTotalStat.completed++;
    }
    return { gameStats: nextGameStats, totalStat: nextTotalStat };
  }, [data?.views]);

  if (isLoading) {
    return <Loading message="Loading achievements" />;
  }

  if (error) {
    return (
      <BlockPanel className="text-center py-12 text-mc-red">
        {error instanceof Error ? error.message : 'Failed to load player'}
      </BlockPanel>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start">
      <aside className="w-full lg:w-56 shrink-0 order-2 lg:order-1 lg:sticky lg:top-6 lg:self-start">
        <GameSidebar
          games={data.games}
          params={params}
          setParams={setParams}
          totalStat={totalStat}
          gameStats={gameStats}
        />
      </aside>
      <div className="flex-1 min-w-0 space-y-4 order-1 lg:order-2">
        <PlayerHeader
          player={data.player}
          query={username}
          views={data.views}
          cache={data.cache}
          showDebug={params.debug}
        />
        <PlayerNav username={username} />

        <AchievementFilters
          params={params}
          setParams={setParams}
          clearParams={clearParams}
        />

        <AchievementTables tieredViews={tieredFiltered} oneTimeViews={oneTimeFiltered} />
      </div>
    </div>
  );
}

export function AchievementsPage({ username }: { username: string }) {
  return (
    <Suspense fallback={<Loading />}>
      <AchievementsContent username={username} />
    </Suspense>
  );
}
