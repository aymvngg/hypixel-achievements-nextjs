import { PixelImg } from "@/components/ui/PixelImg";
import type { PublicPlayerData } from "@/lib/hypixel/types";
import { PlayerName } from "@/components/player/PlayerName";
import { playerHeadUrl } from "@/lib/util/playerHead";

function ScoreSide({
	player,
	name,
	total,
	wins,
	align,
}: {
	player: PublicPlayerData;
	name: string;
	total: number;
	wins: boolean;
	align: "left" | "right";
}) {
	return (
		<div
			className={`flex items-center gap-3 min-w-0 ${align === "left" ? "" : "flex-row-reverse text-right"}`}
		>
			<PixelImg
				src={playerHeadUrl(player.uuid, 48)}
				alt={name}
				width={48}
				height={48}
				className="border-2 border-mc-border rounded-sm shrink-0"
				loading="eager"
			/>
			<div className="min-w-0">
				<p
					className={`font-[family-name:var(--font-pixel)] truncate ${
						wins ? "text-mc-grass" : "text-mc-stone-light"
					}`}
				>
					<PlayerName player={player} />
				</p>
				<p className="text-lg font-[family-name:var(--font-pixel)] text-mc-grass tabular-nums">
					{total.toLocaleString()}
				</p>
			</div>
		</div>
	);
}

export function CompareSummary({
	p1,
	p2,
	p1Name,
	p2Name,
	p1Total,
	p2Total,
}: {
	p1: PublicPlayerData;
	p2: PublicPlayerData;
	p1Name: string;
	p2Name: string;
	p1Total: number;
	p2Total: number;
}) {
	const p1Wins = p1Total > p2Total;
	const p2Wins = p2Total > p1Total;
	const tied = p1Total === p2Total;

	return (
		<div className="rounded-sm border-[3px] border-mc-border bg-mc-stone-dark shadow-[inset_2px_2px_0_rgba(255,255,255,0.06),inset_-2px_-2px_0_rgba(0,0,0,0.25),4px_4px_0_rgba(0,0,0,0.35)] px-4 py-3">
			<div className="flex items-center justify-between gap-3">
				<ScoreSide
					player={p1}
					name={p1Name}
					total={p1Total}
					wins={p1Wins}
					align="left"
				/>
				<div className="text-center shrink-0">
					<span
						className={`font-[family-name:var(--font-pixel)] text-2xl ${
							tied ? "text-mc-stone-light" : "text-mc-gold"
						}`}
						aria-hidden
					>
						VS
					</span>
					{!tied && (
						<p className="text-[0.6rem] font-[family-name:var(--font-pixel)] uppercase text-mc-stone-light tracking-wider">
							{p1Wins ? p1Name : p2Name} ahead
						</p>
					)}
				</div>
				<ScoreSide
					player={p2}
					name={p2Name}
					total={p2Total}
					wins={p2Wins}
					align="right"
				/>
			</div>
		</div>
	);
}
