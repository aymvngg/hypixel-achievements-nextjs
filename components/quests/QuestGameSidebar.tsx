"use client";

import { useState } from "react";
import { BlockPanel } from "@/components/ui/BlockPanel";
import { PixelImg } from "@/components/ui/PixelImg";
import type { GameStat } from "@/lib/logic/achievement-stats";
import type { QuestSearchParams } from "@/lib/util/quest-filters";
import { formatGameLabel, gameIconUrl } from "@/lib/util/games";
import { formatPlayerCount } from "@/lib/util/gamecounts";

const PF = "font-[family-name:var(--font-pixel)]";

function GameNavItem({
	active,
	label,
	stat,
	icon,
	count,
	onSelect,
}: {
	active: boolean;
	label: string;
	stat: GameStat;
	icon?: string | null;
	count?: number;
	onSelect: () => void;
}) {
	const pct = stat.total > 0 ? (stat.completed / stat.total) * 100 : 0;
	return (
		<button
			type="button"
			onClick={onSelect}
			aria-current={active ? "page" : undefined}
			className={`block w-full text-left rounded-sm border-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mc-sky/60 focus-visible:ring-offset-2 focus-visible:ring-offset-mc-panel ${
				active
					? "bg-mc-grass/20 border-mc-grass"
					: "border-transparent hover:bg-mc-stone-dark hover:border-mc-border/50"
			}`}
		>
			<div className="flex items-center gap-2.5 px-2 py-1.5">
				{icon ? (
					<PixelImg
						src={icon}
						alt=""
						width={28}
						height={28}
						className="shrink-0"
					/>
				) : (
					<span className="w-7 h-7 shrink-0" />
				)}
				<div className="flex-1 min-w-0">
					<div className="flex items-center justify-between gap-2">
						<span
							className={`truncate flex-1 min-w-0 ${PF} text-xs ${active ? "text-mc-sky" : "text-foreground"}`}
						>
							{label}
						</span>
						<div className="flex items-center gap-1.5 shrink-0">
							{count !== undefined && (
								<span
									className={`${PF} text-[0.6rem] tabular-nums ${active ? "text-mc-grass" : "text-mc-stone-light"}`}
									title={`${count.toLocaleString()} players online`}
								>
									{formatPlayerCount(count)}
								</span>
							)}
							<span
								className={`${PF} text-[0.65rem] tabular-nums ${active ? "text-mc-sky" : "text-mc-stone-light"}`}
							>
								{pct.toFixed(0)}%
							</span>
						</div>
					</div>
					<div className="mt-1 h-1.5 bg-black/40 overflow-hidden">
						<div
							className={`h-full ${active ? "bg-mc-gold" : "bg-mc-grass"}`}
							style={{ width: `${Math.min(100, pct)}%` }}
						/>
					</div>
				</div>
			</div>
		</button>
	);
}

export function QuestGameSidebar({
	games,
	params,
	totalStat,
	gameStats,
	counts,
	onGameSelect,
}: {
	games: string[];
	params: QuestSearchParams;
	totalStat: GameStat;
	gameStats: Record<string, GameStat>;
	counts?: Record<string, number>;
	onGameSelect: (game: string | undefined) => void;
}) {
	const sortedGames = [...games].sort((a, b) =>
		formatGameLabel(a).localeCompare(formatGameLabel(b)),
	);
	const activeGame = params.game;
	const activeLabel = activeGame ? formatGameLabel(activeGame) : "All games";
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<BlockPanel className="p-2 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto">
			<button
				type="button"
				onClick={() => setMobileOpen((v) => !v)}
				aria-expanded={mobileOpen}
				className="lg:hidden flex items-center justify-between gap-2 w-full px-2 py-1.5 mb-1 rounded-sm border-2 border-mc-border bg-mc-stone text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mc-sky/60 focus-visible:ring-offset-2 focus-visible:ring-offset-mc-panel"
			>
				<span className={`${PF} text-xs uppercase tracking-wide truncate`}>
					{activeLabel}
				</span>
				<span
					className={`${PF} text-[0.65rem] text-mc-stone-light transition-transform ${mobileOpen ? "rotate-90" : ""}`}
					aria-hidden
				>
					▶
				</span>
			</button>
			<nav
				className={`flex-col gap-0.5 ${mobileOpen ? "flex" : "hidden"} lg:flex`}
			>
				<GameNavItem
					active={!activeGame}
					label="All games"
					stat={totalStat}
					icon="/icons/general.png"
					onSelect={() => {
						onGameSelect(undefined);
						setMobileOpen(false);
					}}
				/>
				{sortedGames.map((game) => (
					<GameNavItem
						key={game}
						active={activeGame === game}
						label={formatGameLabel(game)}
						stat={
							gameStats[game] ?? {
								count: 0,
								obtained: 0,
								total: 0,
								completed: 0,
							}
						}
						icon={gameIconUrl(game)}
						count={counts?.[game]}
						onSelect={() => {
							onGameSelect(game);
							setMobileOpen(false);
						}}
					/>
				))}
			</nav>
		</BlockPanel>
	);
}
