export type CacheResult<T> =
	| { ok: true; data: T }
	| { ok: false; error: string };

export interface AchievementView {
	game: string;
	codeName: string;
	name: string;
	description: string;
	type: "ONE_TIME" | "TIERED";
	completed: boolean;
	points: number;
	obtainedPoints: number;
	totalPoints: number;
	gamePercentUnlocked: number;
	globalPercentUnlocked: number;
	currentTier: number;
	maxTier: number;
	progress: number;
	/** Next tier goal shown in the description (tiered only). */
	tierTarget: number;
	/** Progress toward the next tier goal, 0–1 (1 when max tier reached). */
	tierProgress: number;
}

export interface PlayerQuestCompletion {
	/** Hypixel API field for completion time (epoch ms). */
	time?: number;
	/** Legacy/alternate field name used in some parsers. */
	timeCompleted?: number;
}

export interface PlayerQuestEntry {
	active?: {
		started?: number;
		objectives?: Record<string, number>;
	};
	completions?: PlayerQuestCompletion[];
}

export type PlayerQuestData = Record<string, PlayerQuestEntry>;

export type QuestResetType = "DAILY" | "WEEKLY" | "MONTHLY";

export type QuestStatus = "active" | "completed" | "available";

export interface QuestObjectiveView {
	id: string;
	target: number;
	progress: number;
	completed: boolean;
}

export interface QuestRewardView {
	type: string;
	amount: number;
}

export interface QuestView {
	game: string;
	questId: string;
	name: string;
	description: string;
	type: QuestResetType;
	objectives: QuestObjectiveView[];
	rewards: QuestRewardView[];
	status: QuestStatus;
	startedAt?: number;
	completedAt?: number;
	/** Aggregate progress across objectives, 0–1. */
	progress: number;
}

export interface PlayerData {
	uuid: string;
	nickname: string;
	rank: string | null;
	/** Raw Minecraft-formatted prefix, if Hypixel provides one (for special ranks). */
	rankPrefix: string | null;
	/** Hex color for MVP+/MVP++ plus sign (rankPlusColor). */
	rankPlusColor: string | null;
	/** Hex color for MVP++ monthly prefix (monthlyRankColor). */
	rankPrefixColor: string | null;
	achievementPoints: number;
	tieredAchievements: Record<string, number>;
	oneTimeAchievements: string[];
	quests: PlayerQuestData;
}

/** The player fields required by the browser UI. Keep achievement state server-only. */
export interface PublicPlayerData {
	uuid: string;
	nickname: string;
	rank: string | null;
	rankPrefix: string | null;
	rankPlusColor: string | null;
	rankPrefixColor: string | null;
}

export function toPublicPlayerData(player: PlayerData): PublicPlayerData {
	return {
		uuid: player.uuid,
		nickname: player.nickname,
		rank: player.rank,
		rankPrefix: player.rankPrefix,
		rankPlusColor: player.rankPlusColor,
		rankPrefixColor: player.rankPrefixColor,
	};
}

export function sumObtainedPoints(views: AchievementView[]): number {
	return views.reduce((sum, v) => sum + v.obtainedPoints, 0);
}
