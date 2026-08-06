import type { QuestResetType, QuestStatus, QuestView } from "@/lib/hypixel/types";
import { formatGameLabel } from "@/lib/util/games";

export type QuestStatusFilter = QuestStatus;
export type QuestTypeFilter = QuestResetType;
export type QuestSortField = "progress" | "name" | "game" | "type" | "status";

export const QUEST_SORT_LABELS: Record<QuestSortField, string> = {
	progress: "Progress",
	name: "Name",
	game: "Game",
	type: "Type",
	status: "Status",
};

export interface QuestSearchParams {
	game?: string;
	type?: QuestTypeFilter;
	status?: QuestStatusFilter;
	search?: string;
	sort?: QuestSortField;
	desc?: boolean;
}

export function parseQuestSearchParams(
	params: Record<string, string | string[] | undefined>,
): QuestSearchParams {
	const get = (key: string) => {
		const v = params[key];
		return typeof v === "string" ? v : undefined;
	};

	const type = get("type");
	const status = get("status");
	const sort = get("sort");

	return {
		game: get("game") || undefined,
		type:
			type === "DAILY" || type === "WEEKLY" || type === "MONTHLY"
				? type
				: undefined,
		status:
			status === "active" ||
			status === "completed" ||
			status === "available"
				? status
				: undefined,
		search: get("search") || undefined,
		sort:
			sort === "progress" ||
			sort === "name" ||
			sort === "game" ||
			sort === "type" ||
			sort === "status"
				? sort
				: undefined,
		desc: get("desc") === "1" || get("desc") === "true",
	};
}

export function buildQuestSearchParams(
	current: QuestSearchParams,
	updates: Partial<QuestSearchParams>,
): URLSearchParams {
	const merged = { ...current, ...updates };
	const params = new URLSearchParams();

	if (merged.game) params.set("game", merged.game);
	if (merged.type) params.set("type", merged.type);
	if (merged.status) params.set("status", merged.status);
	if (merged.search) params.set("search", merged.search);
	if (merged.sort) params.set("sort", merged.sort);
	if (merged.desc) params.set("desc", "1");

	return params;
}

export function syncQuestFiltersToUrl(params: QuestSearchParams): void {
	if (typeof window === "undefined") return;
	const qs = buildQuestSearchParams({}, params).toString();
	const next = qs
		? `${window.location.pathname}?${qs}`
		: window.location.pathname;
	window.history.replaceState(window.history.state, "", next);
}

export function filterQuestViews(
	views: import("@/lib/hypixel/types").QuestView[],
	params: QuestSearchParams,
): import("@/lib/hypixel/types").QuestView[] {
	let filtered = views;

	if (params.game) {
		filtered = filtered.filter((v) => v.game === params.game);
	}

	if (params.type) {
		filtered = filtered.filter((v) => v.type === params.type);
	}

	if (params.status) {
		filtered = filtered.filter((v) => v.status === params.status);
	}

	if (params.search) {
		const q = params.search.toLowerCase();
		filtered = filtered.filter(
			(v) =>
				v.name.toLowerCase().includes(q) ||
				v.description.toLowerCase().includes(q),
		);
	}

	return filtered;
}

const TYPE_ORDER: Record<QuestResetType, number> = {
	DAILY: 0,
	WEEKLY: 1,
	MONTHLY: 2,
};

const STATUS_ORDER: Record<QuestStatus, number> = {
	active: 0,
	available: 1,
	completed: 2,
};

export function sortQuestViews(
	views: QuestView[],
	params: QuestSearchParams,
): QuestView[] {
	const field = params.sort ?? "progress";
	const desc = params.sort ? (params.desc ?? false) : true;

	const sorted = [...views].sort((a, b) => {
		switch (field) {
			case "name":
				return a.name.localeCompare(b.name);
			case "game":
				return (
					formatGameLabel(a.game).localeCompare(
						formatGameLabel(b.game),
					) || a.name.localeCompare(b.name)
				);
			case "type":
				return (
					TYPE_ORDER[a.type] - TYPE_ORDER[b.type] ||
					b.progress - a.progress
				);
			case "status":
				return (
					STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
					b.progress - a.progress
				);
			case "progress":
			default: {
				const rank = (q: QuestView) =>
					q.status === "completed" ? -1 : q.progress;
				return rank(a) - rank(b);
			}
		}
	});

	return desc ? sorted.reverse() : sorted;
}
