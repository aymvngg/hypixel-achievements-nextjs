"use client";

import { useEffect, useState } from "react";
import { QuestFilters } from "@/components/quests/QuestFilters";
import { QuestGameSidebar } from "@/components/quests/QuestGameSidebar";
import { QuestList } from "@/components/quests/QuestList";
import type { QuestView } from "@/lib/hypixel/types";
import { computeQuestGameStats } from "@/lib/logic/quest-stats";
import {
	filterQuestViews,
	parseQuestSearchParams,
	sortQuestViews,
	syncQuestFiltersToUrl,
	type QuestSearchParams,
} from "@/lib/util/quest-filters";

export function PlayerQuestExplorer({
	initialParams,
	views,
	games,
	counts,
	modeCounts,
}: {
	initialParams: QuestSearchParams;
	views: QuestView[];
	games: string[];
	counts?: Record<string, number>;
	modeCounts?: Record<string, Record<string, number>>;
}) {
	const [params, setParams] = useState(initialParams);

	function updateParams(updates: Partial<QuestSearchParams>) {
		setParams((current) => {
			const next = { ...current, ...updates };
			syncQuestFiltersToUrl(next);
			return next;
		});
	}

	function clearParams() {
		setParams({});
		syncQuestFiltersToUrl({});
	}

	useEffect(() => {
		const onPopState = () => {
			const parsed = parseQuestSearchParams(
				Object.fromEntries(new URLSearchParams(window.location.search)),
			);
			setParams(parsed);
		};

		window.addEventListener("popstate", onPopState);
		return () => window.removeEventListener("popstate", onPopState);
	}, []);

	const filtered = sortQuestViews(filterQuestViews(views, params), params);
	const { gameStats, totalStat } = computeQuestGameStats(views);
	const showingFiltered = filtered.length !== views.length;
	const showGameOnCard = !params.game;

	return (
		<div className="flex flex-col lg:flex-row gap-4 items-start">
			<aside className="w-full lg:w-56 shrink-0 lg:sticky lg:top-6 lg:self-start">
				<QuestGameSidebar
					games={games}
					params={params}
					totalStat={totalStat}
					gameStats={gameStats}
					counts={counts}
					onGameSelect={(game) => updateParams({ game })}
				/>
			</aside>
			<div className="flex-1 min-w-0 space-y-4">
				<div className="sticky top-0 z-20 -mx-4 px-4 py-2 bg-background/95 backdrop-blur-sm border-b border-mc-border/40 space-y-2 lg:static lg:mx-0 lg:px-0 lg:py-0 lg:bg-transparent lg:backdrop-blur-none lg:border-b-0">
					<QuestFilters
						params={params}
						onChange={updateParams}
						onClear={clearParams}
					/>
					{showingFiltered && (
						<p className="text-xs font-[family-name:var(--font-pixel)] text-mc-stone-light tracking-wide">
							Showing {filtered.length.toLocaleString()} of{" "}
							{views.length.toLocaleString()} quests
						</p>
					)}
				</div>
				<QuestList
					quests={filtered}
					showGameOnCard={showGameOnCard}
					counts={counts}
					modeCounts={modeCounts}
				/>
			</div>
		</div>
	);
}
