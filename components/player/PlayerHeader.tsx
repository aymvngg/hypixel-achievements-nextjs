import { PixelImg } from "@/components/ui/PixelImg";
import type { PublicPlayerData } from "@/lib/hypixel/types";
import { getDisplayName } from "@/lib/util/display";
import { playerHeadUrl } from "@/lib/util/playerHead";
import { BlockPanel } from "@/components/ui/BlockPanel";
import { PlayerName } from "@/components/player/PlayerName";

export function PlayerHeader({
	player,
	query,
}: {
	player: PublicPlayerData;
	query: string;
}) {
	const displayName = getDisplayName(player, query);

	return (
		<BlockPanel variant="elevated" className="relative overflow-hidden">
			<div className="relative grid grid-cols-[auto_1fr] gap-x-4 sm:gap-x-5">
				<div className="shrink-0">
					<div className="rounded-sm border-[3px] border-mc-border overflow-hidden">
						<PixelImg
							src={playerHeadUrl(player.uuid, 96)}
							alt={displayName}
							width={96}
							height={96}
							className="block w-16 h-16 sm:w-24 sm:h-24"
							loading="eager"
						/>
					</div>
				</div>

				<div className="flex flex-col justify-center min-w-0">
					<h1 className="font-[family-name:var(--font-pixel)] text-xl sm:text-3xl tracking-[0.06em] leading-tight [text-shadow:2px_2px_0_rgba(0,0,0,0.45)] min-w-0 overflow-hidden">
						<PlayerName
							player={player}
							fallback={query}
							stackOnMobile
						/>
					</h1>
				</div>
			</div>
		</BlockPanel>
	);
}
