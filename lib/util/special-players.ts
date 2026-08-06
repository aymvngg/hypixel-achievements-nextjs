import data from "@/lib/util/special-players.json"

export type PlayerBadgeType = "early-tester" | "owner" | "technoblade"

function normalize(uuid: string): string {
	return uuid.toLowerCase().replace(/-/g, "")
}

const OWNERS = new Set(data.owners.map(normalize))
const EARLY_TESTERS = new Set(data.earlyTesters.map(normalize))
const TECHNOBLADE = new Set(data.technoblade.map(normalize))

export function getPlayerBadge(uuid: string): PlayerBadgeType | null {
	const id = normalize(uuid)
	if (OWNERS.has(id)) return "owner"
	if (EARLY_TESTERS.has(id)) return "early-tester"
	if (TECHNOBLADE.has(id)) return "technoblade"
	return null
}
