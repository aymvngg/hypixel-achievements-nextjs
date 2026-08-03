import Image from 'next/image';
import type { AchievementView, PlayerData } from '@/lib/hypixel/types';
import { sumObtainedPoints } from '@/lib/hypixel/types';
import { getDisplayName } from '@/lib/util/display';
import { playerHeadUrl } from '@/lib/util/playerHead';
import { BlockPanel } from '@/components/ui/BlockPanel';

export function PlayerHeader({
  player,
  query,
  views,
  cache,
  showDebug,
}: {
  player: PlayerData;
  query: string;
  views?: AchievementView[];
  cache?: { achievementsHit?: boolean; playerHit?: boolean };
  showDebug?: boolean;
}) {
  const displayName = getDisplayName(player, query);
  const obtained = views ? sumObtainedPoints(views) : player.achievementPoints;
  const total = views?.reduce((s, v) => s + v.totalPoints, 0) ?? 0;
  const pct = total > 0 ? ((obtained / total) * 100).toFixed(1) : '0.0';

  return (
    <BlockPanel className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <Image
        src={playerHeadUrl(player.uuid, 64)}
        alt={displayName}
        width={64}
        height={64}
        className="border-3 border-mc-border"
        unoptimized
      />
      <div className="flex-1 min-w-0">
        <h1 className="font-[family-name:var(--font-pixel)] text-2xl text-mc-gold truncate">
          {displayName}
        </h1>
        <p className="text-mc-sky text-sm mt-1">
          <span className="text-mc-gold font-bold">{obtained.toLocaleString()}</span>
          {' / '}
          {total.toLocaleString()} AP ({pct}%)
        </p>
        {showDebug && cache && (
          <p className="text-xs text-mc-stone-light mt-1 font-mono">
            {cache.achievementsHit ? 'HIT' : 'MISS'} ACH ·{' '}
            {cache.playerHit ? 'HIT' : 'MISS'} PLR
          </p>
        )}
      </div>
    </BlockPanel>
  );
}
