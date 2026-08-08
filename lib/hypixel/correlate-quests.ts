import type {
	PlayerQuestData,
	PlayerQuestEntry,
	QuestObjectiveView,
	QuestResetType,
	QuestRewardView,
	QuestStatus,
	QuestView,
} from "@/lib/hypixel/types";
import {
	filterQuestGames,
	normalizeQuestGameKey,
} from "@/lib/util/quest-games";
import { getPeriodStart } from "@/lib/util/quest-resets";
import { deriveQuestMode } from "@/lib/util/quest-modes";

export interface RawQuestObjective {
	id: string;
	type: "IntegerObjective" | "BooleanObjective";
	integer?: string;
}

export interface RawQuestDefinition {
	id: string;
	name: string;
	description: string;
	objectives: RawQuestObjective[];
	requirements?: Array<{ type?: string }>;
	rewards?: Array<{ type?: string; amount?: number }>;
}

export interface RawQuestsResponse {
	quests: Record<string, RawQuestDefinition[]>;
}

function parseResetType(
	requirements: RawQuestDefinition["requirements"],
): QuestResetType | null {
	const type = requirements?.[0]?.type;
	if (type === "DailyResetQuestRequirement") return "DAILY";
	if (type === "WeeklyResetQuestRequirement") return "WEEKLY";
	if (type === "MonthlyResetQuestRequirement") return "MONTHLY";
	return null;
}

function isMythicOrSpecialQuest(def: RawQuestDefinition): boolean {
	const name = def.name.toLowerCase();
	if (name.includes("mythic quest")) return true;
	return (
		def.rewards?.some((r) => r.type?.toLowerCase().includes("mythic")) ??
		false
	);
}

function objectiveTarget(obj: RawQuestObjective): number {
	if (obj.type === "BooleanObjective") return 1;
	const parsed = parseInt(obj.integer ?? "1", 10);
	return Number.isFinite(parsed) ? parsed : 1;
}

function latestCompletionInPeriod(
	entry: PlayerQuestEntry | undefined,
	periodStart: number,
): number | undefined {
	const completions = entry?.completions;
	if (!completions?.length) return undefined;

	let latest: number | undefined;
	for (const completion of completions) {
		const time = completion.time ?? completion.timeCompleted;
		if (!time || time < periodStart) continue;
		if (!latest || time > latest) latest = time;
	}
	return latest;
}

function buildObjectives(
	defs: RawQuestObjective[],
	status: QuestStatus,
	activeObjectives?: Record<string, number>,
): QuestObjectiveView[] {
	return defs.map((def) => {
		const target = objectiveTarget(def);
		let progress = 0;

		if (status === "completed") {
			progress = target;
		} else if (status === "active" && activeObjectives) {
			const raw = activeObjectives[def.id];
			if (raw !== undefined) {
				progress = Math.min(raw, target);
			}
		}

		return {
			id: def.id,
			target,
			progress,
			completed: progress >= target,
		};
	});
}

function deriveStatus(
	type: QuestResetType,
	entry: PlayerQuestEntry | undefined,
	periodStart: number,
): {
	status: QuestStatus;
	startedAt?: number;
	completedAt?: number;
	activeObjectives?: Record<string, number>;
} {
	const completedAt = latestCompletionInPeriod(entry, periodStart);
	if (completedAt !== undefined) {
		return { status: "completed", completedAt };
	}

	if (entry?.active) {
		return {
			status: "active",
			startedAt: entry.active.started,
			activeObjectives: entry.active.objectives,
		};
	}

	return { status: "available" };
}

function aggregateProgress(objectives: QuestObjectiveView[]): number {
	if (objectives.length === 0) return 0;
	const sum = objectives.reduce(
		(acc, obj) => acc + Math.min(obj.progress / obj.target, 1),
		0,
	);
	return sum / objectives.length;
}

function parseRewards(
	rewards: RawQuestDefinition["rewards"],
): QuestRewardView[] {
	if (!rewards?.length) return [];
	return rewards
		.filter((r) => r.type && r.amount !== undefined)
		.map((r) => ({
			type: r.type!,
			amount: r.amount!,
		}));
}

export function correlateQuests(
	questDefs: RawQuestsResponse,
	playerQuests: PlayerQuestData,
	now = Date.now(),
): QuestView[] {
	const results: QuestView[] = [];
	const periodStarts: Record<QuestResetType, number> = {
		DAILY: getPeriodStart("DAILY", now),
		WEEKLY: getPeriodStart("WEEKLY", now),
		MONTHLY: getPeriodStart("MONTHLY", now),
	};

	for (const [apiGame, quests] of Object.entries(questDefs.quests)) {
		const game = normalizeQuestGameKey(apiGame);
		if (filterQuestGames([game]).length === 0) continue;

		for (const def of quests) {
			if (isMythicOrSpecialQuest(def)) continue;

			const type = parseResetType(def.requirements);
			if (!type) continue;

			const entry = playerQuests[def.id];
			const { status, startedAt, completedAt, activeObjectives } =
				deriveStatus(type, entry, periodStarts[type]);
			const objectives = buildObjectives(
				def.objectives,
				status,
				activeObjectives,
			);
			const mode = deriveQuestMode(game, def);

			results.push({
				game,
				questId: def.id,
				modeKeys: mode?.modeKeys,
				countsGame: mode?.countsGame,
				modeLabel: mode?.label,
				name: def.name.trim(),
				description: def.description.trim(),
				type,
				objectives,
				rewards: parseRewards(def.rewards),
				status,
				startedAt,
				completedAt,
				progress: aggregateProgress(objectives),
			});
		}
	}

	return results;
}

export function getQuestGameNames(views: QuestView[]): string[] {
	const games = new Set<string>();
	for (const view of views) {
		games.add(view.game);
	}
	return filterQuestGames([...games]).sort((a, b) => a.localeCompare(b));
}
