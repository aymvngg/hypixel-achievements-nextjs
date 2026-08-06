import "server-only";

import { cacheLife } from "next/cache";
import type { Achievements } from "hypixel-api-reborn";
import { Player } from "hypixel-api-reborn";
import { getHypixelClient } from "@/lib/hypixel/client";
import { correlateAchievements, getGameNames } from "@/lib/hypixel/correlate";
import { isUuid, normalizeUuid } from "@/lib/util/validate";
import { withRetry } from "@/lib/hypixel/retry";
import type { AchievementView, PlayerData } from "@/lib/hypixel/types";
import { toPublicPlayerData } from "@/lib/hypixel/types";
import { sumObtainedPoints } from "@/lib/hypixel/types";

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
	};
}

async function loadAchievements(): Promise<Achievements> {
	"use cache: remote";
	cacheLife("hypixelAchievements");

	const client = getHypixelClient();
	const achievements = await withRetry(() => client.getAchievements());
	return toCacheable(achievements);
}

async function loadMojangUuid(ign: string): Promise<string | null> {
	"use cache: remote";
	cacheLife("hypixelUuid");

	const normalized = ign.toLowerCase();
	const res = await withRetry(() =>
		fetch(`${MOJANG_API}/${encodeURIComponent(normalized)}`),
	);
	if (!res.ok) return null;

	const data = (await res.json()) as { id?: string };
	if (!data.id) return null;

	return normalizeUuid(data.id);
}

async function loadPlayerByUuid(uuid: string): Promise<PlayerData> {
	"use cache: remote";
	cacheLife("hypixelPlayer");

	const normalizedUuid = normalizeUuid(uuid);
	const client = getHypixelClient();
	const rawRes = (await withRetry(() =>
		client.getPlayer(normalizedUuid, {
			guild: false,
			recentGames: false,
			raw: true,
		}),
	)) as RawPlayerResponse;

	return parsePlayerData(rawRes);
}

export async function fetchAchievements(): Promise<Achievements> {
	return dedupe("achievements", loadAchievements);
}

export async function fetchPlayer(query: string): Promise<PlayerData> {
	const key = `player:${query.trim().toLowerCase()}`;
	return dedupe(key, async () => {
		const normalizedQuery = query.trim();
		const uuid = isUuid(normalizedQuery)
			? normalizeUuid(normalizedQuery)
			: await loadMojangUuid(normalizedQuery);

		if (!uuid) {
			throw new Error(`No UUID found for player "${normalizedQuery}"`);
		}

		return loadPlayerByUuid(uuid);
	});
}
