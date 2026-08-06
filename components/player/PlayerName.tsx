import { getNicknameColor, hasDisplayableRank } from "@/lib/util/rank-format";
import { RankPrefix } from "@/components/player/RankPrefix";
import { PlayerBadge } from "@/components/player/PlayerBadge";
import { getPlayerBadge } from "@/lib/util/special-players";
import type { PublicPlayerData } from "@/lib/hypixel/types";

export function PlayerName({
	player,
	fallback,
	className = "",
}: {
	player: PublicPlayerData;
	fallback?: string;
	className?: string;
}) {
	const nickname =
		player.nickname && player.nickname !== "UNKNOWN"
			? player.nickname
			: (fallback ?? "Unknown");
	const nicknameColor = getNicknameColor(
		player.rank,
		player.rankPrefixColor,
	);
	const badge = getPlayerBadge(player.uuid);

	return (
		<span className={`block truncate ${className}`}>
			<span className="whitespace-nowrap">
				{hasDisplayableRank(player.rank) && (
					<RankPrefix
						rank={player.rank}
						plusColorHex={player.rankPlusColor}
						prefixColorHex={player.rankPrefixColor}
						rawPrefix={player.rankPrefix}
					/>
				)}
				<span style={{ color: nicknameColor }}>{nickname}</span>
			</span>
			{badge && (
				<span className="ml-1.5 align-middle">
					<PlayerBadge type={badge} />
				</span>
			)}
		</span>
	);
}
