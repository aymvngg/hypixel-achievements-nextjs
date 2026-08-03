'use client';

import { useSearchParams } from 'next/navigation';
import { usePlayerData } from '@/lib/queries/use-player-data';
import {
  computeGameBreakdown,
  sortGameBreakdown,
  type BreakdownMetric,
} from '@/lib/logic/breakdown';
import { PlayerHeader } from '@/components/player/PlayerHeader';
import { PlayerNav } from '@/components/layout/PlayerNav';
import { BreakdownTable } from '@/components/breakdown/BreakdownTable';
import { BlockPanel } from '@/components/ui/BlockPanel';
import { PixelButton } from '@/components/ui/PixelButton';
import Link from 'next/link';

function BreakdownContent({ username }: { username: string }) {
  const searchParams = useSearchParams();
  const metric = (searchParams.get('metric') === 'missing' ? 'missing' : 'obtained') as BreakdownMetric;
  const encoded = encodeURIComponent(username);

  const { data, isLoading, error } = usePlayerData(username);

  if (isLoading) {
    return <BlockPanel className="text-center py-12 text-mc-sky">Loading breakdown...</BlockPanel>;
  }

  if (error) {
    return (
      <BlockPanel className="text-center py-12 text-mc-red">
        {error instanceof Error ? error.message : 'Failed to load player'}
      </BlockPanel>
    );
  }

  if (!data) return null;

  const rows = sortGameBreakdown(computeGameBreakdown(data.views), metric);
  const totals = rows.reduce(
    (acc, r) => ({
      obtained: acc.obtained + r.obtained,
      missing: acc.missing + r.missing,
      total: acc.total + r.total,
    }),
    { obtained: 0, missing: 0, total: 0 },
  );

  return (
    <div className="space-y-4">
      <PlayerHeader player={data.player} query={username} views={data.views} />
      <PlayerNav username={username} />
      <div className="flex gap-2">
        <Link href={`/player/${encoded}/breakdown?metric=obtained`}>
          <PixelButton variant={metric === 'obtained' ? 'grass' : 'stone'}>By Obtained</PixelButton>
        </Link>
        <Link href={`/player/${encoded}/breakdown?metric=missing`}>
          <PixelButton variant={metric === 'missing' ? 'grass' : 'stone'}>By Missing</PixelButton>
        </Link>
      </div>
      <BreakdownTable rows={rows} totals={totals} />
    </div>
  );
}

export function BreakdownPage({ username }: { username: string }) {
  return <BreakdownContent username={username} />;
}
