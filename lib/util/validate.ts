const USERNAME_RE = /^[a-zA-Z0-9_]{1,16}$/;

export function normalizeUuid(uuid: string): string {
	return uuid.replace(/-/g, "").toLowerCase();
}

export function isUuid(query: string): boolean {
	const compact = normalizeUuid(query);
	return compact.length === 32 && /^[0-9a-f]+$/.test(compact);
}

export function validatePlayerQuery(query: string): string {
	const trimmed = query.trim();
	if (!trimmed) {
		throw new Error("Player name or UUID is required");
	}
	if (trimmed.length > 36) {
		throw new Error("Player query is too long");
	}
	if (!isUuid(trimmed) && !USERNAME_RE.test(trimmed)) {
		throw new Error("Invalid player name or UUID format");
	}
	return trimmed;
}

export function parsePositiveInt(value: string, optionName: string): number {
	if (!/^\d+$/.test(value.trim())) {
		throw new Error(
			`Invalid ${optionName}: "${value}". Must be a positive integer`,
		);
	}
	const n = Number(value);
	if (n < 1) {
		throw new Error(
			`Invalid ${optionName}: "${value}". Must be at least 1`,
		);
	}
	return n;
}

export type AchievementType = "one-time" | "tiered";
export type AchievementStatus = "completed" | "uncompleted";
export type SortField =
	"name" | "game-pct" | "global-pct" | "progress" | "points";

export function validateType(v: string): AchievementType {
	if (v !== "one-time" && v !== "tiered") {
		throw new Error(`Invalid type: "${v}". Must be "one-time" or "tiered"`);
	}
	return v;
}

export function validateStatus(v: string): AchievementStatus {
	if (v !== "completed" && v !== "uncompleted") {
		throw new Error(
			`Invalid status: "${v}". Must be "completed" or "uncompleted"`,
		);
	}
	return v;
}

export function validateSort(v: string): SortField {
	const valid: SortField[] = [
		"name",
		"game-pct",
		"global-pct",
		"progress",
		"points",
	];
	if (!valid.includes(v as SortField)) {
		throw new Error(
			`Invalid sort: "${v}". Must be one of: ${valid.join(", ")}`,
		);
	}
	return v as SortField;
}

export function resolveGameFilter(gameArg: string, games: string[]): string {
	const lower = gameArg.toLowerCase();
	const match = games.find((g) => g.toLowerCase() === lower);
	if (!match) {
		throw new Error(
			`Unknown game "${gameArg}". Available: ${games.join(", ")}`,
		);
	}
	return match;
}
