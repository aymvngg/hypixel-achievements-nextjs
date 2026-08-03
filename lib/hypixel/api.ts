import 'server-only';

import type { Achievements } from 'hypixel-api-reborn';
import { Player } from 'hypixel-api-reborn';
import { getHypixelClient } from '@/lib/hypixel/client';
import { correlateAchievements, getGameNames } from '@/lib/hypixel/correlate';
import { readCache, writeCache, ACHIEVEMENTS_TTL, PLAYER_TTL, UUID_TTL } from '@/lib/hypixel/cache';
import { isUuid, normalizeUuid } from '@/lib/util/validate';
import { withRetry } from '@/lib/hypixel/retry';
import type { AchievementView, PlayerData } from '@/lib/hypixel/types';
import { toPublicPlayerData } from '@/lib/hypixel/types';
import { sumObtainedPoints } from '@/lib/hypixel/types';

export type { AchievementView, PlayerData };
export { toPublicPlayerData };
export { sumObtainedPoints };
export { correlateAchievements, getGameNames };

const MOJANG_API = 'https://api.mojang.com/users/profiles/minecraft';

const inFlight = new Map<string, Promise<unknown>>();

function dedupe<T>(key: string, operation: () => Promise<T>): Promise<T> {
  const existing = inFlight.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const promise = operation().finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}

export interface CacheResult<T> {
  data: T;
  hit: boolean;
}

interface PlayerCache {
  uuid: string;
  nickname: string;
  rank: string | null;
  rankPlusColor: string | null;
  rankPrefixColor: string | null;
  achievementPoints: number;
  tiered: Record<string, number>;
  oneTime: string[];
}

function colorHex(color: { toHex: () => string } | null | undefined): string | null {
  return color?.toHex() ?? null;
}

async function resolveMojangUuid(ign: string): Promise<string | null> {
  return dedupe(`mojang:${ign.toLowerCase()}`, () => resolveMojangUuidUncached(ign));
}

async function resolveMojangUuidUncached(ign: string): Promise<string | null> {
  const key = `uuid-${ign.toLowerCase()}`;
  const cached = await readCache<{ uuid: string }>(key);
  if (cached) return normalizeUuid(cached.uuid);

  const res = await withRetry(() => fetch(`${MOJANG_API}/${encodeURIComponent(ign)}`));
  if (!res.ok) return null;
  const data = await res.json() as { id?: string };
  if (!data.id) return null;
  const uuid = normalizeUuid(data.id);
  await writeCache(key, { uuid }, UUID_TTL);
  return uuid;
}

interface RawPlayerResponse {
  player?: {
    achievementsOneTime?: string[];
    [key: string]: unknown;
  };
}

function playerFromCache(cached: PlayerCache): PlayerData {
  return {
    uuid: cached.uuid,
    nickname: cached.nickname,
    rank: cached.rank,
    rankPlusColor: cached.rankPlusColor ?? null,
    rankPrefixColor: cached.rankPrefixColor ?? null,
    achievementPoints: cached.achievementPoints,
    tieredAchievements: cached.tiered,
    oneTimeAchievements: cached.oneTime ?? [],
  };
}

async function readPlayerCache(uuid: string): Promise<PlayerData | null> {
  const cached = await readCache<PlayerCache>(`player-v3-${normalizeUuid(uuid)}`);
  return cached ? playerFromCache(cached) : null;
}

async function writePlayerCache(data: PlayerCache): Promise<void> {
  const uuid = normalizeUuid(data.uuid);
  await writeCache(`player-v3-${uuid}`, { ...data, uuid }, PLAYER_TTL);
}

export async function fetchAchievements(): Promise<CacheResult<Achievements>> {
  return dedupe('achievements', fetchAchievementsUncached);
}

async function fetchAchievementsUncached(): Promise<CacheResult<Achievements>> {
  const cached = await readCache<Achievements>('achievements');
  if (cached) return { data: cached, hit: true };

  const client = getHypixelClient();
  const achievements = await withRetry(() => client.getAchievements());
  await writeCache('achievements', achievements, ACHIEVEMENTS_TTL);
  return { data: achievements, hit: false };
}

export async function fetchPlayer(query: string): Promise<CacheResult<PlayerData>> {
  const key = `player:${query.trim().toLowerCase()}`;
  return dedupe(key, () => fetchPlayerUncached(query));
}

async function fetchPlayerUncached(query: string): Promise<CacheResult<PlayerData>> {
  let resolvedQuery = isUuid(query) ? normalizeUuid(query) : query;

  if (isUuid(query)) {
    const cached = await readPlayerCache(resolvedQuery);
    if (cached) return { data: cached, hit: true };
  } else {
    const uuid = await resolveMojangUuid(resolvedQuery);
    if (!uuid) throw new Error(`No UUID found for player "${resolvedQuery}"`);
    const cached = await readPlayerCache(uuid);
    if (cached) return { data: cached, hit: true };
    resolvedQuery = uuid;
  }

  const client = getHypixelClient();
  const rawRes = (await withRetry(() =>
    client.getPlayer(resolvedQuery, { guild: false, recentGames: false, raw: true }),
  )) as RawPlayerResponse;

  if (!rawRes.player) {
    throw new Error('[hypixel-api-reborn] Player has never logged into Hypixel.');
  }

  const player = new Player(rawRes.player);
  const tiered = player.achievements as Record<string, number>;
  const oneTime: string[] = rawRes.player.achievementsOneTime ?? [];

  const cacheData: PlayerCache = {
    uuid: normalizeUuid(player.uuid),
    nickname: player.nickname,
    rank: player.rank as string | null,
    rankPlusColor: colorHex(player.plusColor),
    rankPrefixColor: colorHex(player.prefixColor),
    achievementPoints: player.achievementPoints,
    tiered,
    oneTime,
  };

  await writePlayerCache(cacheData);

  return {
    data: {
      uuid: cacheData.uuid,
      nickname: player.nickname,
      rank: player.rank as string | null,
      rankPlusColor: cacheData.rankPlusColor,
      rankPrefixColor: cacheData.rankPrefixColor,
      achievementPoints: player.achievementPoints,
      tieredAchievements: tiered,
      oneTimeAchievements: oneTime,
    },
    hit: false,
  };
}

