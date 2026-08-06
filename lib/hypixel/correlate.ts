import type { Achievements, GameAchievement } from "hypixel-api-reborn";
import type { AchievementView, PlayerData } from "@/lib/hypixel/types";
import { isRemovedGame } from "@/lib/util/games";

function toCamelCase(snake: string): string {
	return snake
		.toLowerCase()
		.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

function finitePercent(value: unknown): number {
	const n = Number(value);
	return Number.isFinite(n) ? n : 0;
}

function tierObtainedPoints(
	tierInformation: unknown,
	currentTier: number,
): number {
	const ti = tierInformation as
		{ tierInfo?: Array<{ points?: number }> } | null | undefined;
	if (!ti?.tierInfo || currentTier <= 0) return 0;
	let sum = 0;
	for (let t = 0; t < currentTier; t++) {
		sum += ti.tierInfo[t]?.points ?? 0;
	}
	return sum;
}

export function correlateAchievements(
	achievements: Achievements,
	player: PlayerData,
	legacyKeys?: ReadonlySet<string>,
): AchievementView[] {
	const results: AchievementView[] = [];
	const oneTimeSet = new Set(player.oneTimeAchievements);

	for (const [, gameData] of Object.entries(
		achievements.achievementsPerGame,
	)) {
		const ga = gameData as GameAchievement;
		if (isRemovedGame(ga.category)) continue;

		for (const achievement of ga.achievements) {
			if (legacyKeys?.has(`${ga.category}_${achievement.codeName}`)) {
				continue;
			}

			const bareKey = toCamelCase(achievement.codeName);
			const prefixedKey = toCamelCase(
				`${ga.category}_${achievement.codeName}`,
			);
			const playerVal =
				player.tieredAchievements[prefixedKey] ??
				player.tieredAchievements[bareKey] ??
				0;

			const isTiered = achievement.type === "TIERED";
			let maxTier = 1;
			let currentTier = 0;
			let description = achievement.description;
			let tierTarget = 0;
			let tierProgress = 0;

			if (isTiered && achievement.tierInformation) {
				const ti = achievement.tierInformation as {
					maxTier: number;
					getTier?: (tier: number) => { amountRequired: number };
					tierInfo?: Array<{ amount: string }>;
				};
				maxTier = ti.maxTier;
				for (let t = maxTier; t >= 1; t--) {
					let amount = 0;
					if (typeof ti.getTier === "function") {
						amount = ti.getTier(t).amountRequired;
					} else {
						const info = ti.tierInfo?.[t - 1];
						amount = info ? parseInt(info.amount, 10) || 0 : 0;
					}
					if (Number(playerVal) >= amount) {
						currentTier = t;
						break;
					}
				}
				const nextTier = Math.min(currentTier + 1, maxTier);
				let nextAmount = 0;
				if (typeof ti.getTier === "function") {
					nextAmount = ti.getTier(nextTier).amountRequired;
				} else {
					const info = ti.tierInfo?.[nextTier - 1];
					nextAmount = info ? parseInt(info.amount, 10) || 0 : 0;
				}
				const stat = Number(playerVal);
				tierTarget = nextAmount;
				if (currentTier >= maxTier) {
					tierProgress = 1;
				} else if (nextAmount > 0) {
					tierProgress = Math.min(1, stat / nextAmount);
				}
				description = description.replace(
					"%%value%%",
					`[${stat.toLocaleString()} / ${nextAmount.toLocaleString()}]`,
				);
			}

			const oneTimeKey = `${ga.category}_${achievement.codeName.toLowerCase()}`;
			const completed = isTiered
				? currentTier >= maxTier
				: oneTimeSet.has(oneTimeKey);
			const progress =
				isTiered && maxTier > 0
					? currentTier / maxTier
					: completed
						? 1
						: 0;
			const totalPoints = achievement.points;
			const obtainedPoints = isTiered
				? tierObtainedPoints(achievement.tierInformation, currentTier)
				: completed
					? totalPoints
					: 0;

			results.push({
				game: ga.category,
				codeName: achievement.codeName,
				name: achievement.name,
				description,
				type: achievement.type,
				completed,
				points: achievement.points,
				obtainedPoints,
				totalPoints,
				gamePercentUnlocked: finitePercent(achievement.rarity.local),
				globalPercentUnlocked: finitePercent(achievement.rarity.global),
				currentTier,
				maxTier,
				progress,
				tierTarget,
				tierProgress,
			});
		}
	}

	return results;
}

export function getGameNames(achievements: Achievements): string[] {
	return Object.keys(achievements.achievementsPerGame)
		.filter((game) => !isRemovedGame(game))
		.sort();
}
