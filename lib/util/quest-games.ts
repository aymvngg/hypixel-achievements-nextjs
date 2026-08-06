import { isRemovedGame } from "@/lib/util/games";

/** Maps Hypixel quest resource keys to UI game keys. */
const QUEST_API_TO_UI: Record<string, string> = {
	hungergames: "blitz",
	mcgo: "copsandcrims",
	battleground: "warlords",
};

export function normalizeQuestGameKey(apiKey: string): string {
	const lower = apiKey.toLowerCase();
	return QUEST_API_TO_UI[lower] ?? lower;
}

export function filterQuestGames(games: string[]): string[] {
	return games.filter((game) => !isRemovedGame(game));
}
