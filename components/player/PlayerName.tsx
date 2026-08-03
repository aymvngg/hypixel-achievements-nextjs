import { getNicknameColor, hasDisplayableRank } from '@/lib/util/rank-format';
import { RankPrefix } from '@/components/player/RankPrefix';
import type { PublicPlayerData } from '@/lib/hypixel/types';

export function PlayerName({
  player,
  fallback,
  className = '',
}: {
  player: PublicPlayerData;
  fallback?: string;
  className?: string;
}) {
  const nickname =
    player.nickname && player.nickname !== 'UNKNOWN' ? player.nickname : (fallback ?? 'Unknown');
  const nicknameColor = getNicknameColor(player.rank, player.rankPrefixColor);

  return (
    <span className={`block truncate ${className}`}>
      <span className="whitespace-nowrap">
        {hasDisplayableRank(player.rank) && (
          <RankPrefix
            rank={player.rank}
            plusColorHex={player.rankPlusColor}
            prefixColorHex={player.rankPrefixColor}
          />
        )}
        <span style={{ color: nicknameColor }}>{nickname}</span>
      </span>
    </span>
  );
}
