"use client"

import { useEffect, useState } from "react"
import { AchievementFilters } from "@/components/achievements/AchievementFilters"
import { AchievementTables } from "@/components/achievements/AchievementTables"
import { GameSidebar } from "@/components/achievements/GameSidebar"
import { fromCompactViews, type CompactAchievementView } from "@/lib/client/compact-views"
import { computeGameStats, splitViewsByType } from "@/lib/logic/achievement-stats"
import {
	parseAchievementSearchParams,
	syncAchievementFiltersToUrl,
	type AchievementSearchParams,
} from "@/lib/search-params"
import { recomputeViews } from "@/lib/util/filters"

export function PlayerAchievementsExplorer({
	initialParams,
	compactViews,
	games,
	currentUsername,
}: {
	initialParams: AchievementSearchParams
	compactViews: CompactAchievementView[]
	games: string[]
	currentUsername: string
}) {
	const [views] = useState(() => fromCompactViews(compactViews))
	const [params, setParams] = useState(initialParams)

	function updateParams(updates: Partial<AchievementSearchParams>) {
		setParams((current) => {
			const next = { ...current, ...updates }
			syncAchievementFiltersToUrl(next)
			return next
		})
	}

	function clearParams() {
		setParams({})
		syncAchievementFiltersToUrl({})
	}

	useEffect(() => {
		const onPopState = () => {
			const parsed = parseAchievementSearchParams(Object.fromEntries(new URLSearchParams(window.location.search)))
			setParams(parsed)
		}

		window.addEventListener("popstate", onPopState)
		return () => window.removeEventListener("popstate", onPopState)
	}, [])

	const { gameStats, totalStat } = computeGameStats(views)

	const filtered = recomputeViews(views, {
		search: params.search,
		game: params.game,
		type: params.type,
		status: params.status,
		sortField: params.sort ?? "points",
		sortDesc: params.sort ? (params.desc ?? false) : true,
	})
	const { tiered, oneTime } = splitViewsByType(filtered)
	const showingFiltered = filtered.length !== views.length

	return (
		<div className="flex flex-col lg:flex-row gap-4 items-start">
			<aside className="w-full lg:w-56 shrink-0 order-2 lg:order-1 lg:sticky lg:top-6 lg:self-start">
				<GameSidebar
					games={games}
					params={params}
					totalStat={totalStat}
					gameStats={gameStats}
					currentUsername={currentUsername}
					onGameSelect={(game) => updateParams({ game })}
				/>
			</aside>
			<div className="flex-1 min-w-0 space-y-4 order-1 lg:order-2">
				<div className="sticky top-0 z-20 -mx-4 px-4 py-2 bg-background/95 backdrop-blur-sm border-b border-mc-border/40 space-y-2 lg:static lg:mx-0 lg:px-0 lg:py-0 lg:bg-transparent lg:backdrop-blur-none lg:border-b-0">
					<AchievementFilters params={params} onChange={updateParams} onClear={clearParams} />
					{showingFiltered && (
						<p className="text-xs font-[family-name:var(--font-pixel)] text-mc-stone-light tracking-wide">
							Showing {filtered.length.toLocaleString()} of {views.length.toLocaleString()} achievements
						</p>
					)}
				</div>
				<AchievementTables params={params} tieredViews={tiered} oneTimeViews={oneTime} onSort={updateParams} />
			</div>
		</div>
	)
}
