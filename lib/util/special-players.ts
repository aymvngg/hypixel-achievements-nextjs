import data from "@/lib/util/special-players.json";

export type PlayerBadgeType =
	| "early-tester"
	| "mommy"
	| "owner"
	| "technoblade"
	| "bored"
	| "ladybug";

function normalize(uuid: string): string {
	return uuid.toLowerCase().replace(/-/g, "");
}

const OWNERS = new Set(data.owners.map(normalize));
const EARLY_TESTERS = new Set(data.earlyTesters.map(normalize));
const MOMMIES = new Set(data.mommies.map(normalize));
const TECHNOBLADE = new Set(data.technoblade.map(normalize));
const BORED = new Set(data.bored.map(normalize));
const LADYBUGS = new Set(data.ladybugs.map(normalize));

export function getPlayerBadge(uuid: string): PlayerBadgeType | null {
	const id = normalize(uuid);
	if (OWNERS.has(id)) return "owner";
	if (MOMMIES.has(id)) return "mommy";
	if (EARLY_TESTERS.has(id)) return "early-tester";
	if (TECHNOBLADE.has(id)) return "technoblade";
	if (BORED.has(id)) return "bored";
	if (LADYBUGS.has(id)) return "ladybug";
	return null;
}
