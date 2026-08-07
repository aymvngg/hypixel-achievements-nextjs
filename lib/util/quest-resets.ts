import type { QuestResetType } from "@/lib/hypixel/types";

/** Hypixel quest periods use Eastern Time (server local time). */
const HYPIXEL_TZ = "America/New_York";

const ET_FORMATTER = new Intl.DateTimeFormat("en-US", {
	timeZone: HYPIXEL_TZ,
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
	weekday: "short",
	hour: "2-digit",
	minute: "2-digit",
	second: "2-digit",
	hourCycle: "h23",
});

const WEEKDAY: Record<string, number> = {
	Sun: 0,
	Mon: 1,
	Tue: 2,
	Wed: 3,
	Thu: 4,
	Fri: 5,
	Sat: 6,
};

interface EasternWallTime {
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	second: number;
	weekday: number;
}

function readEasternWallTime(ms: number): EasternWallTime {
	const parts = ET_FORMATTER.formatToParts(new Date(ms));

	const get = (type: Intl.DateTimeFormatPartTypes) =>
		parts.find((p) => p.type === type)?.value ?? "";

	return {
		year: Number(get("year")),
		month: Number(get("month")),
		day: Number(get("day")),
		hour: Number(get("hour")),
		minute: Number(get("minute")),
		second: Number(get("second")),
		weekday: WEEKDAY[get("weekday")] ?? 0,
	};
}

/** UTC instant for a wall-clock time in Eastern on a calendar date. */
function easternWallTimeToUtc(
	year: number,
	month: number,
	day: number,
	hour = 0,
	minute = 0,
	second = 0,
): number {
	// Eastern offset is UTC-4 (EDT) or UTC-5 (EST); search a small UTC window.
	for (let utcHour = hour - 6; utcHour <= hour + 2; utcHour++) {
		const candidate = Date.UTC(year, month - 1, day, utcHour, minute, second);
		const wall = readEasternWallTime(candidate);
		if (
			wall.year === year &&
			wall.month === month &&
			wall.day === day &&
			wall.hour === hour &&
			wall.minute === minute &&
			wall.second === second
		) {
			return candidate;
		}
	}

	// Fallback for edge cases (DST transitions).
	for (let offsetHours = -6; offsetHours <= -3; offsetHours++) {
		const candidate = Date.UTC(
			year,
			month - 1,
			day,
			hour - offsetHours,
			minute,
			second,
		);
		const wall = readEasternWallTime(candidate);
		if (
			wall.year === year &&
			wall.month === month &&
			wall.day === day &&
			wall.hour === hour
		) {
			return candidate;
		}
	}

	return Date.UTC(year, month - 1, day, hour + 5, minute, second);
}

function shiftCalendarDate(
	year: number,
	month: number,
	day: number,
	deltaDays: number,
): { year: number; month: number; day: number } {
	const d = new Date(Date.UTC(year, month - 1, day));
	d.setUTCDate(d.getUTCDate() + deltaDays);
	return {
		year: d.getUTCFullYear(),
		month: d.getUTCMonth() + 1,
		day: d.getUTCDate(),
	};
}

function startOfEasternDay(now: number): number {
	const { year, month, day } = readEasternWallTime(now);
	return easternWallTimeToUtc(year, month, day);
}

/** Weekly quests reset Thursday night Eastern (= Friday 00:00 ET). */
function startOfEasternWeek(now: number): number {
	const wall = readEasternWallTime(now);
	const daysSinceFriday =
		wall.weekday >= 5 ? wall.weekday - 5 : wall.weekday + 2;
	const friday = shiftCalendarDate(
		wall.year,
		wall.month,
		wall.day,
		-daysSinceFriday,
	);
	return easternWallTimeToUtc(friday.year, friday.month, friday.day);
}

function startOfEasternMonth(now: number): number {
	const { year, month } = readEasternWallTime(now);
	return easternWallTimeToUtc(year, month, 1);
}

export function getPeriodStart(
	type: QuestResetType,
	now = Date.now(),
): number {
	if (type === "DAILY") {
		return startOfEasternDay(now);
	}

	if (type === "WEEKLY") {
		return startOfEasternWeek(now);
	}

	return startOfEasternMonth(now);
}

export function getPeriodEnd(type: QuestResetType, now = Date.now()): number {
	if (type === "DAILY") {
		const wall = readEasternWallTime(now);
		const next = shiftCalendarDate(wall.year, wall.month, wall.day, 1);
		return easternWallTimeToUtc(next.year, next.month, next.day);
	}

	if (type === "WEEKLY") {
		const startWall = readEasternWallTime(getPeriodStart("WEEKLY", now));
		const nextFriday = shiftCalendarDate(
			startWall.year,
			startWall.month,
			startWall.day,
			7,
		);
		return easternWallTimeToUtc(
			nextFriday.year,
			nextFriday.month,
			nextFriday.day,
		);
	}

	const wall = readEasternWallTime(now);
	const nextMonth =
		wall.month === 12
			? { year: wall.year + 1, month: 1, day: 1 }
			: { year: wall.year, month: wall.month + 1, day: 1 };
	return easternWallTimeToUtc(nextMonth.year, nextMonth.month, nextMonth.day);
}

export function msUntilReset(type: QuestResetType, now = Date.now()): number {
	return Math.max(0, getPeriodEnd(type, now) - now);
}

export function formatResetIn(ms: number): string {
	const totalMinutes = Math.ceil(ms / (1000 * 60));
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	if (hours >= 24) {
		const days = Math.floor(hours / 24);
		const remHours = hours % 24;
		if (remHours > 0 && minutes > 0) {
			return `${days}d ${remHours}h ${minutes}m`;
		}
		if (remHours > 0) {
			return `${days}d ${remHours}h`;
		}
		return `${days}d`;
	}

	if (hours > 0) {
		return `${hours}h ${minutes}m`;
	}

	return `${minutes}m`;
}

export function isWithinPeriod(
	timestamp: number,
	type: QuestResetType,
	now = Date.now(),
): boolean {
	return timestamp >= getPeriodStart(type, now);
}
