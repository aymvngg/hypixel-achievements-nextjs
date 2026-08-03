export const REMOVED_GAMES = new Set(['skyclash', 'truecombat']);

const GAME_LABELS: Record<string, string> = {
  arcade: 'Arcade',
  arena: 'Arena Brawl',
  bedwars: 'Bed Wars',
  blitz: 'Blitz Survival Games',
  buildbattle: 'Build Battle',
  christmas2017: 'Christmas',
  copsandcrims: 'Cops and Crims',
  duels: 'Duels',
  easter: 'Easter',
  gingerbread: 'Turbo Kart Racers',
  general: 'General',
  halloween2017: 'Halloween',
  housing: 'Housing',
  murdermystery: 'Murder Mystery',
  paintball: 'Paintball',
  pit: 'The Pit',
  quake: 'Quake',
  skyblock: 'SkyBlock',
  skywars: 'SkyWars',
  speeduhc: 'Speed UHC',
  supersmash: 'Smash Heroes',
  summer: 'Summer',
  tntgames: 'TNT Games',
  uhc: 'UHC Champions',
  vampirez: 'VampireZ',
  walls: 'Walls',
  walls3: 'Mega Walls',
  warlords: 'Warlords',
  woolgames: 'Wool Wars',
};

export function formatGameLabel(game: string): string {
  return GAME_LABELS[game.toLowerCase()] ?? game;
}

export function isRemovedGame(game: string): boolean {
  return REMOVED_GAMES.has(game.toLowerCase());
}

export function filterRemovedGames(games: string[]): string[] {
  return games.filter((game) => !isRemovedGame(game));
}
