export const REMOVED_GAMES = new Set(["skyclash", "truecombat"]);

const GAME_LABELS: Record<string, string> = {
	arcade: "Arcade",
	arena: "Arena Brawl",
	bedwars: "Bed Wars",
	blitz: "Blitz Survival Games",
	buildbattle: "Build Battle",
	christmas2017: "Christmas",
	copsandcrims: "Cops and Crims",
	duels: "Duels",
	easter: "Easter",
	gingerbread: "Turbo Kart Racers",
	general: "General",
	halloween2017: "Halloween",
	housing: "Housing",
	murdermystery: "Murder Mystery",
	paintball: "Paintball",
	pit: "The Pit",
	quake: "Quake",
	skyblock: "SkyBlock",
	skywars: "SkyWars",
	speeduhc: "Speed UHC",
	supersmash: "Smash Heroes",
	summer: "Summer",
	tntgames: "TNT Games",
	uhc: "UHC Champions",
	vampirez: "VampireZ",
	walls: "Walls",
	walls3: "Mega Walls",
	warlords: "Warlords",
	woolgames: "Wool Wars",
};

const GAME_ICONS: Record<string, string> = {
	arcade: "/icons/arcade.png",
	arena: "/icons/arena.png",
	bedwars: "/icons/bedwars.png",
	blitz: "/icons/blitz.png",
	buildbattle: "/icons/buildbattle.png",
	christmas2017: "/icons/christmas2017.png",
	copsandcrims: "/icons/copsandcrims.png",
	duels: "/icons/duels.png",
	easter: "/icons/easter.png",
	gingerbread: "/icons/gingerbread.png",
	general: "/icons/general.png",
	halloween2017: "/icons/halloween2017.png",
	housing: "/icons/housing.png",
	murdermystery: "/icons/murdermystery.png",
	paintball: "/icons/paintball.png",
	pit: "/icons/pit.png",
	quake: "/icons/quake.png",
	skyblock: "/icons/skyblock.png",
	skyclash: "/icons/skyclash.png",
	skywars: "/icons/skywars.png",
	speeduhc: "/icons/speeduhc.png",
	supersmash: "/icons/supersmash.png",
	summer: "/icons/summer.png",
	tntgames: "/icons/tntgames.png",
	truecombat: "/icons/truecombat.png",
	uhc: "/icons/uhc.png",
	vampirez: "/icons/vampirez.png",
	walls: "/icons/walls.png",
	walls3: "/icons/walls3.png",
	warlords: "/icons/warlords.png",
	woolgames: "/icons/woolgames.png",
};

export const ALL_GAME_KEYS = Object.keys(GAME_ICONS);

export function gameIconUrl(game: string): string | null {
	return GAME_ICONS[game.toLowerCase()] ?? null;
}

export function formatGameLabel(game: string): string {
	return GAME_LABELS[game.toLowerCase()] ?? game;
}

export function isRemovedGame(game: string): boolean {
	return REMOVED_GAMES.has(game.toLowerCase());
}

export function filterRemovedGames(games: string[]): string[] {
	return games.filter((game) => !isRemovedGame(game));
}
