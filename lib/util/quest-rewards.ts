const REWARD_LABELS: Record<string, string> = {
	MultipliedExperienceReward: "Network XP",
	MultipliedCoinReward: "Coins",
	CoinReward: "Coins",
	FestivalExperienceReward: "Festival XP",
	BedwarsExpReward: "Bed Wars XP",
	SkyWarsXpReward: "SkyWars XP",
	SkyWarsBonusCoinsReward: "SkyWars Coins",
	SkyWarsTokenReward: "SkyWars Tokens",
	SkyWarsSoulReward: "SkyWars Souls",
	SkyWarsOpalReward: "Opals",
	PitGold: "Gold",
	WoolWarsWoolReward: "Wool",
	WoolGamesExpReward: "Wool Games XP",
	ArenaMagicKeyReward: "Magic Keys",
	WarlordsBrokenWeaponReward: "Broken Weapons",
	WarlordsMagicDustReward: "Magic Dust",
	WarlordsVoidShardReward: "Void Shards",
	WarlordsLegendaryBrokenWeaponReward: "Legendary Weapons",
	CrazyWallsSkullReward: "Skulls",
	SkyClashCardPackReward: "Card Packs",
	MegawallsMythicFavorReward: "Mythic Favor",
};

export function formatQuestReward(type: string, amount: number): string {
	const label = REWARD_LABELS[type] ?? type.replace(/Reward$/, "");
	return `${amount.toLocaleString()} ${label}`;
}
