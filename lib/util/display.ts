import type { PublicPlayerData } from '@/lib/hypixel/types';
import { formatRankPrefix, hasDisplayableRank } from '@/lib/util/rank-format';

export function getDisplayName(player: PublicPlayerData, query: string): string {
  if (!player.nickname || player.nickname === 'UNKNOWN') return query;
  if (!hasDisplayableRank(player.rank)) return player.nickname;
  const prefix = formatRankPrefix(
    player.rank,
    player.rankPlusColor,
    player.rankPrefixColor,
  )
    .map((s) => s.text)
    .join('');
  return `${prefix}${player.nickname}`;
}

export function shortName(playerOrDisplayName: PublicPlayerData | string): string {
  if (typeof playerOrDisplayName === 'string') {
    const parts = playerOrDisplayName.split(' ');
    return parts[parts.length - 1];
  }
  return playerOrDisplayName.nickname && playerOrDisplayName.nickname !== 'UNKNOWN'
    ? playerOrDisplayName.nickname
    : 'Player';
}
