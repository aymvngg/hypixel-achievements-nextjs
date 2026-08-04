import type { Metadata } from 'next';
import { Suspense } from 'react';
import { GameSidebar } from '@/components/achievements/GameSidebar';
import { PlayerHeader } from '@/components/player/PlayerHeader';
import { PlayerNav } from '@/components/layout/PlayerNav';
import { BlockPanel } from '@/components/ui/BlockPanel';
import { Loading } from '@/components/ui/Loading';
import { getPlayerPageData } from '@/lib/hypixel/player-data';
import { computeGameStats, splitViewsByType } from '@/lib/logic/achievement-stats';
import { getDisplayName } from '@/lib/util/display';
import { formatError } from '@/lib/util/errors';
import { recomputeViews } from '@/lib/util/filters';
import { AchievementFilters } from '@/components/achievements/AchievementFilters';
import { AchievementTables } from '@/components/achievements/AchievementTables';
import { parseAchievementSearchParams } from '@/lib/search-params';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const decoded = decodeURIComponent(username);
  try {
    const data = await getPlayerPageData(decoded);
    const name = getDisplayName(data.player, decoded);
    return { title: `${name}'s Achievements` };
  } catch {
    return { title: 'Player Achievements' };
  }
}

async function PlayerAchievementsContent({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { username } = await params;
  const decoded = decodeURIComponent(username);
  const filterParams = parseAchievementSearchParams(await searchParams);

  let data;
  try {
    data = await getPlayerPageData(decoded);
  } catch (err) {
    return (
      <BlockPanel className="text-center py-12 text-mc-red">
        {formatError(err)}
      </BlockPanel>
    );
  }

  const filtered = recomputeViews(data.views, {
    search: filterParams.search,
    game: filterParams.game,
    type: filterParams.type,
    status: filterParams.status,
    sortField: filterParams.sort ?? 'points',
    sortDesc: filterParams.sort ? (filterParams.desc ?? false) : true,
  });
  const { tiered, oneTime } = splitViewsByType(filtered);
  const { gameStats, totalStat } = computeGameStats(data.views);

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start">
      <aside className="w-full lg:w-56 shrink-0 order-2 lg:order-1 lg:sticky lg:top-6 lg:self-start">
        <GameSidebar
          username={decoded}
          games={data.games}
          params={filterParams}
          totalStat={totalStat}
          gameStats={gameStats}
        />
      </aside>
      <div className="flex-1 min-w-0 space-y-4 order-1 lg:order-2">
        <PlayerHeader player={data.player} query={decoded} views={data.views} />
        <PlayerNav username={decoded} activeSection="achievements" />
        <AchievementFilters username={decoded} params={filterParams} />
        <AchievementTables
          username={decoded}
          params={filterParams}
          tieredViews={tiered}
          oneTimeViews={oneTime}
        />
      </div>
    </div>
  );
}

export default function PlayerAchievementsPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<Loading message="Loading achievements" />}>
      <PlayerAchievementsContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
