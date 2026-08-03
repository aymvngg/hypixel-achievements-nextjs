import type { PlayerData } from '@/lib/hypixel/types';

export function getDisplayName(player: PlayerData, query: string): string {
  return player.nickname && player.nickname !== 'UNKNOWN'
    ? `${player.rank ? `[${player.rank}] ` : ''}${player.nickname}`
    : query;
}

export function shortName(displayName: string): string {
  const parts = displayName.split(' ');
  return parts[parts.length - 1];
}
