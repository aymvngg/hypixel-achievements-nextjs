import { getNicknameColor, hasDisplayableRank } from "@/lib/util/rank-format";
import { RankPrefix } from "@/components/player/RankPrefix";
import { PlayerBadge } from "@/components/player/PlayerBadge";
import { getPlayerBadge } from "@/lib/util/special-players";
import type { PublicPlayerData } from "@/lib/hypixel/types";

export function PlayerName({
	player,
	fallback,
	className = "",
	stackBadge = false,
}: {
	player: PublicPlayerData;
	fallback?: string;
	className?: string;
	stackBadge?: boolean;
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
			className={`min-w-0 ${
				stackBadge
					? "flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5"
					: "block truncate"
			} ${className}`}
		>
			<span
				className={`whitespace-nowrap ${stackBadge ? "min-w-0 overflow-hidden text-ellipsis" : ""}`}
			>
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
						stackBadge
							? "shrink-0"
							: "ml-1.5 align-middle shrink-0"
					}
				>
					<PlayerBadge type={badge} />
				</span>
			)}
		</span>
	);
}
