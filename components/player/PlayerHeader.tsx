import { PixelImg } from "@/components/ui/PixelImg";
import type { PublicPlayerData } from "@/lib/hypixel/types";
import type { PlayerAchievementSummary } from "@/lib/logic/achievement-stats";
import { getDisplayName } from "@/lib/util/display";
import { playerHeadUrl } from "@/lib/util/playerHead";
import { BlockPanel } from "@/components/ui/BlockPanel";
import { PlayerName } from "@/components/player/PlayerName";

export function PlayerHeader({
	player,
	query,
	summary,
}: {
	player: PublicPlayerData;
	query: string;
	summary: PlayerAchievementSummary;
}) {
	const displayName = getDisplayName(player, query);
	const { obtained, total, completedCount, totalCount } = summary;
	const pct = total > 0 ? ((obtained / total) * 100).toFixed(1) : "0.0";
	const pctNum = total > 0 ? (obtained / total) * 100 : 0;

	return (
		<BlockPanel variant="elevated" className="relative overflow-hidden">
			<div className="relative flex flex-col gap-4">
				{/* Top row: Avatar + Name + Stats */}
				<div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
					{/* Avatar */}
					<div className="shrink-0">
						<div className="rounded-sm border-[3px] border-mc-border overflow-hidden">
							<PixelImg
								src={playerHeadUrl(player.uuid, 96)}
								alt={displayName}
								width={96}
								height={96}
								className="block"
								loading="eager"
							/>
						</div>
					</div>

					{/* Name + Stats */}
					<div className="flex-1 min-w-0 space-y-3">
						<h1 className="font-[family-name:var(--font-pixel)] text-3xl tracking-[0.06em] leading-tight [text-shadow:2px_2px_0_rgba(0,0,0,0.45)] min-w-0">
							<PlayerName player={player} fallback={query} />
						</h1>

						{/* Stat cards row */}
						<div className="flex flex-wrap gap-3">
							{/* AP Card */}
							<div className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-sm border-2 border-mc-border bg-mc-stone-dark shadow-[inset_1px_1px_3px_rgba(0,0,0,0.35)]">
								<span className="text-[0.6rem] font-[family-name:var(--font-pixel)] uppercase text-mc-stone-light tracking-wider">
									Achievement Points
								</span>
								<span className="font-[family-name:var(--font-pixel)] text-sm">
									<span className="text-mc-grass font-bold">
										{obtained.toLocaleString()}
									</span>
									<span className="text-mc-stone-light">
										{" "}
										/ {total.toLocaleString()}
									</span>
								</span>
							</div>

							{/* Completion % Card */}
							<div className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-sm border-2 border-mc-border bg-mc-stone-dark shadow-[inset_1px_1px_3px_rgba(0,0,0,0.35)]">
								<span className="text-[0.6rem] font-[family-name:var(--font-pixel)] uppercase text-mc-stone-light tracking-wider">
									Completion
								</span>
								<span className="font-[family-name:var(--font-pixel)] text-lg text-mc-sky font-bold">
									{pct}%
								</span>
							</div>

							{/* Achievements Completed Card */}
							<div className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-sm border-2 border-mc-border bg-mc-stone-dark shadow-[inset_1px_1px_3px_rgba(0,0,0,0.35)]">
								<span className="text-[0.6rem] font-[family-name:var(--font-pixel)] uppercase text-mc-stone-light tracking-wider">
									Completed
								</span>
								<span className="font-[family-name:var(--font-pixel)] text-sm">
									<span className="text-mc-grass font-bold">
										{completedCount}
									</span>
									<span className="text-mc-stone-light">
										{" "}
										/ {totalCount}
									</span>
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Full-width progress bar */}
				<div className="space-y-1">
					<div className="rounded-sm h-2.5 overflow-hidden border-[3px] border-mc-border bg-mc-stone-dark shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_0_rgba(255,255,255,0.05)]">
						<div
							className="h-full bg-mc-grass"
							style={{ width: `${Math.min(100, pctNum)}%` }}
						/>
					</div>
				</div>
			</div>
		</BlockPanel>
	);
}
