import "server-only";

import { cacheLife } from "next/cache";
import type { Achievements } from "hypixel-api-reborn";
import { Player } from "hypixel-api-reborn";
import { getHypixelClient } from "@/lib/hypixel/client";
import { collectLegacyAchievementKeys } from "@/lib/hypixel/achievement-legacy";
import type { RawAchievementsResponse } from "@/lib/hypixel/achievement-legacy";
import { correlateAchievements, getGameNames } from "@/lib/hypixel/correlate";
import type { RawQuestsResponse } from "@/lib/hypixel/correlate-quests";
import { isUuid, normalizeUuid } from "@/lib/util/validate";
import { withRetry } from "@/lib/hypixel/retry";
import { guardUpstream } from "@/lib/ratelimit/check";
import type {
	AchievementView,
	CacheResult,
	PlayerData,
	PlayerQuestData,
} from "@/lib/hypixel/types";
import { toPublicPlayerData } from "@/lib/hypixel/types";
import { sumObtainedPoints } from "@/lib/hypixel/types";
import { formatError } from "@/lib/util/errors";

export type { AchievementView, PlayerData };
export { toPublicPlayerData };
export { sumObtainedPoints };
export { correlateAchievements, getGameNames };

const MOJANG_API = "https://api.mojang.com/users/profiles/minecraft";

const inFlight = new Map<string, Promise<unknown>>();

function dedupe<T>(key: string, operation: () => Promise<T>): Promise<T> {
	const existing = inFlight.get(key) as Promise<T> | undefined;
	if (existing) return existing;

	const promise = operation().finally(() => inFlight.delete(key));
	inFlight.set(key, promise);
	return promise;
}

interface RawPlayerResponse {
	player?: {
		achievementsOneTime?: string[];
		[key: string]: unknown;
	};
}

function colorHex(
	color: { toHex: () => string } | null | undefined,
): string | null {
	return color?.toHex() ?? null;
}

function normalizeRank(
	rawRes: RawPlayerResponse,
	parsedRank: string | null,
): string | null {
	const rawRank = rawRes.player?.rank;
	if (rawRank === "STAFF") return "STAFF";
	return parsedRank;
}

function toCacheable<T>(value: T): T {
	return structuredClone(value);
}

function parsePlayerQuests(raw: unknown): PlayerQuestData {
	if (!raw || typeof raw !== "object") return {};
	return raw as PlayerQuestData;
}

function parsePlayerData(rawRes: RawPlayerResponse): PlayerData {
	if (!rawRes.player) {
		throw new Error(
			"[hypixel-api-reborn] Player has never logged into Hypixel.",
		);
	}

	const player = new Player(rawRes.player);
	const tiered = (player.achievements ?? {}) as Record<string, number>;
	const oneTime: string[] = rawRes.player.achievementsOneTime ?? [];

	return {
		uuid: normalizeUuid(player.uuid),
		nickname: player.nickname,
		rank: normalizeRank(rawRes, player.rank as string | null),
		rankPrefix:
			typeof rawRes.player.prefix === "string"
				? rawRes.player.prefix
				: null,
		rankPlusColor: colorHex(player.plusColor),
		rankPrefixColor: colorHex(player.prefixColor),
		achievementPoints: player.achievementPoints,
		tieredAchievements: tiered,
		oneTimeAchievements: oneTime,
		quests: parsePlayerQuests(rawRes.player.quests),
	};
}

async function loadQuests(): Promise<CacheResult<RawQuestsResponse>> {
	"use cache: remote";
	cacheLife("hypixelAchievements");

	try {
		const client = getHypixelClient();
		const res = (await withRetry(() =>
			client.getQuests({ raw: true }),
		)) as unknown as RawQuestsResponse & { success?: boolean };

		return {
			ok: true,
			data: toCacheable({
				quests: res.quests ?? {},
			}),
		};
	} catch (err) {
		cacheLife("hypixelError");
		return { ok: false, error: formatError(err) };
	}
}

export interface AchievementCatalog {
	achievements: Achievements;
	legacyKeys: ReadonlySet<string>;
}

async function loadAchievements(): Promise<CacheResult<AchievementCatalog>> {
	"use cache: remote";
	cacheLife("hypixelAchievements");

	try {
		const client = getHypixelClient();
		const rawRes = (await withRetry(() =>
			client.getAchievements({ raw: true }),
		)) as unknown as RawAchievementsResponse;
		const achievements = await withRetry(() => client.getAchievements());
		const legacyKeys = collectLegacyAchievementKeys(rawRes);

		return { ok: true, data: toCacheable({ achievements, legacyKeys }) };
	} catch (err) {
		cacheLife("hypixelError");
		return { ok: false, error: formatError(err) };
	}
}

async function loadMojangUuid(
	ign: string,
): Promise<CacheResult<string | null>> {
	"use cache: remote";
	cacheLife("hypixelUuid");

	try {
		const normalized = ign.toLowerCase();
		const res = await withRetry(() =>
			fetch(`${MOJANG_API}/${encodeURIComponent(normalized)}`),
		);
		if (!res.ok) return { ok: true, data: null };

		const data = (await res.json()) as { id?: string };
		if (!data.id) return { ok: true, data: null };

		return { ok: true, data: normalizeUuid(data.id) };
	} catch (err) {
		cacheLife("hypixelError");
		return { ok: false, error: formatError(err) };
	}
}

async function loadPlayerByUuid(
	uuid: string,
): Promise<CacheResult<PlayerData>> {
	"use cache: remote";
	cacheLife("hypixelPlayer");

	try {
		const normalizedUuid = normalizeUuid(uuid);
		const client = getHypixelClient();
		const rawRes = (await withRetry(() =>
			client.getPlayer(normalizedUuid, {
				guild: false,
				recentGames: false,
				raw: true,
			}),
		)) as RawPlayerResponse;

		return { ok: true, data: parsePlayerData(rawRes) };
	} catch (err) {
		cacheLife("hypixelError");
		return { ok: false, error: formatError(err) };
	}
}

export async function fetchAchievements(ip: string): Promise<AchievementCatalog> {
	return dedupe("achievements", async () => {
		guardUpstream({ ip, playerKey: "achievements", cacheWindowMs: 86_400_000 });
		const result = await loadAchievements();
		if (!result.ok) throw new Error(result.error);
		return result.data;
	});
}

export async function fetchQuests(ip: string): Promise<RawQuestsResponse> {
	return dedupe("quests", async () => {
		guardUpstream({ ip, playerKey: "quests", cacheWindowMs: 86_400_000 });
		const result = await loadQuests();
		if (!result.ok) throw new Error(result.error);
		return result.data;
	});
}

export async function fetchPlayer(
	query: string,
	ip: string,
): Promise<PlayerData> {
	const key = `player:${query.trim().toLowerCase()}`;
	return dedupe(key, async () => {
		const normalizedQuery = query.trim();
		const playerKey = normalizedQuery.toLowerCase();
		// UUID lookups are cached for 6h; name lookups resolve to a UUID first
		// (Mojang fetch) then hit the player cache. Treat the player loader as
		// warm for its 5-minute cacheLife so cache hits don't burn budget.
		guardUpstream({
			ip,
			playerKey: isUuid(normalizedQuery)
				? `player:${normalizeUuid(playerKey)}`
				: playerKey,
			cacheWindowMs: 300_000,
		});
		let uuid: string;
		if (isUuid(normalizedQuery)) {
			uuid = normalizeUuid(normalizedQuery);
		} else {
			const mojangResult = await loadMojangUuid(normalizedQuery);
			if (!mojangResult.ok) throw new Error(mojangResult.error);
			if (!mojangResult.data) {
				throw new Error(
					`No UUID found for player "${normalizedQuery}"`,
				);
			}
			uuid = mojangResult.data;
		}

		const playerResult = await loadPlayerByUuid(uuid);
		if (!playerResult.ok) throw new Error(playerResult.error);
		return playerResult.data;
	});
}
