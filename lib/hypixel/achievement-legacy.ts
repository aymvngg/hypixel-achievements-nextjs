interface RawAchievementEntry {
	legacy?: boolean;
}

interface RawGameAchievements {
	one_time?: Record<string, RawAchievementEntry>;
	tiered?: Record<string, RawAchievementEntry>;
}

export interface RawAchievementsResponse {
	achievements: Record<string, RawGameAchievements>;
}

/** Keys in the form `{game}_{codeName}`, matching Hypixel achievement identifiers. */
export function collectLegacyAchievementKeys(
	raw: RawAchievementsResponse,
): Set<string> {
	const keys = new Set<string>();

	for (const [game, gameData] of Object.entries(raw.achievements)) {
		for (const section of [gameData.one_time, gameData.tiered]) {
			if (!section) continue;
			for (const [codeName, entry] of Object.entries(section)) {
				if (entry.legacy) {
					keys.add(`${game}_${codeName}`);
				}
			}
		}
	}

	return keys;
}
