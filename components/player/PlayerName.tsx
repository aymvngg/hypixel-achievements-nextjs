import { getNicknameColor, hasDisplayableRank } from "@/lib/util/rank-format";
import { RankPrefix } from "@/components/player/RankPrefix";
import { PlayerBadge } from "@/components/player/PlayerBadge";
import { getPlayerBadge } from "@/lib/util/special-players";
import type { PublicPlayerData } from "@/lib/hypixel/types";

export function PlayerName({
	player,
	fallback,
	className = "",
	stackOnMobile = false,
}: {
	player: PublicPlayerData;
	fallback?: string;
	className?: string;
	stackOnMobile?: boolean;
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
		<span
			className={`inline-flex items-center min-w-0 ${
				stackOnMobile ? "flex-wrap" : ""
			} ${className}`}
		>
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
				<span
					className={
						stackOnMobile
							? "w-full mt-1 sm:w-auto sm:mt-0 sm:ml-1.5"
							: "ml-1.5"
					}
				>
					<PlayerBadge type={badge} />
				</span>
			)}
		</span>
	);
}
