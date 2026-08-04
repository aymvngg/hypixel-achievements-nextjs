import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BreakdownTable } from '@/components/breakdown/BreakdownTable';
import { PlayerHeader } from '@/components/player/PlayerHeader';
import { PlayerNav } from '@/components/layout/PlayerNav';
import { BlockPanel } from '@/components/ui/BlockPanel';
import { Loading } from '@/components/ui/Loading';
import { getPlayerPageData } from '@/lib/hypixel/player-data';
import { computeGameBreakdown, sortGameBreakdown } from '@/lib/logic/breakdown';
import { getDisplayName } from '@/lib/util/display';
import { formatError } from '@/lib/util/errors';

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
    return { title: `${name}'s Breakdown` };
  } catch {
    return { title: 'Game Breakdown' };
  }
}

async function PlayerBreakdownContent({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const decoded = decodeURIComponent(username);

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

  const rows = sortGameBreakdown(computeGameBreakdown(data.views), 'obtained');

  return (
    <div className="space-y-4">
      <PlayerHeader player={data.player} query={decoded} views={data.views} />
      <PlayerNav username={decoded} activeSection="breakdown" />

      <div className="flex items-center gap-2 px-0.5">
        <span className="w-1.5 h-5 bg-mc-gold" aria-hidden />
        <h2 className="font-[family-name:var(--font-pixel)] text-base tracking-[0.06em] text-mc-sky">
          Game Breakdown
        </h2>
      </div>

      <BreakdownTable rows={rows} />
    </div>
  );
}

export default function PlayerBreakdownPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  return (
    <Suspense fallback={<Loading message="Loading breakdown" />}>
      <PlayerBreakdownContent params={params} />
    </Suspense>
  );
}
