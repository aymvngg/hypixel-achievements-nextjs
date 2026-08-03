'use client';

import { usePlayerData } from '@/lib/queries/use-player-data';
import { computeGameBreakdown, sortGameBreakdown } from '@/lib/logic/breakdown';
import { PlayerHeader } from '@/components/player/PlayerHeader';
import { PlayerNav } from '@/components/layout/PlayerNav';
import { BreakdownTable } from '@/components/breakdown/BreakdownTable';
import { BlockPanel } from '@/components/ui/BlockPanel';
import { Loading } from '@/components/ui/Loading';

function BreakdownContent({ username }: { username: string }) {
  const { data, isLoading, error } = usePlayerData(username);

  if (isLoading) {
    return <Loading message="Loading breakdown" />;
  }

  if (error) {
    return (
      <BlockPanel className="text-center py-12 text-mc-red">
        {error instanceof Error ? error.message : 'Failed to load player'}
      </BlockPanel>
    );
  }

  if (!data) return null;

  const rows = sortGameBreakdown(computeGameBreakdown(data.views), 'obtained');

  return (
    <div className="space-y-4">
      <PlayerHeader player={data.player} query={username} views={data.views} />
      <PlayerNav username={username} />

      {/* Section title */}
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

export function BreakdownPage({ username }: { username: string }) {
  return <BreakdownContent username={username} />;
}
