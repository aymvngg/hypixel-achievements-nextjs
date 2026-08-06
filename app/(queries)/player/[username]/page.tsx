import type { Metadata } from "next"
import { Suspense } from "react"
import { PlayerAchievementsExplorer } from "@/components/achievements/PlayerAchievementsExplorer"
import { PlayerHeader } from "@/components/player/PlayerHeader"
import { PlayerNav } from "@/components/layout/PlayerNav"
import { BlockPanel } from "@/components/ui/BlockPanel"
import { Loading } from "@/components/ui/Loading"
import { getPlayerPageData } from "@/lib/hypixel/player-data"
import { summarizeAchievementViews } from "@/lib/logic/achievement-stats"
import { toCompactViews } from "@/lib/client/compact-views"
import { getDisplayName } from "@/lib/util/display"
import { formatError } from "@/lib/util/errors"
import { parseAchievementSearchParams } from "@/lib/search-params"

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
	const { username } = await params
	const decoded = decodeURIComponent(username)
	try {
		const data = await getPlayerPageData(decoded)
		const name = getDisplayName(data.player, decoded)
		return { title: `${name}'s Achievements` }
	} catch {
		return { title: "Player Achievements" }
	}
}

async function PlayerAchievementsContent({
	params,
	searchParams,
}: {
	params: Promise<{ username: string }>
	searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
	const { username } = await params
	const decoded = decodeURIComponent(username)
	const filterParams = parseAchievementSearchParams(await searchParams)

	let data
	try {
		data = await getPlayerPageData(decoded)
	} catch (err) {
		return <BlockPanel className="text-center py-12 text-mc-red">{formatError(err)}</BlockPanel>
	}

	const summary = summarizeAchievementViews(data.views)

	return (
		<div className="space-y-4">
			<PlayerHeader player={data.player} query={decoded} summary={summary} />
			<PlayerNav username={decoded} activeSection="achievements" />
			<PlayerAchievementsExplorer
				key={decoded}
				initialParams={filterParams}
				compactViews={toCompactViews(data.views)}
				games={data.games}
				currentUsername={decoded}
			/>
		</div>
	)
}

export default function PlayerAchievementsPage({
	params,
	searchParams,
}: {
	params: Promise<{ username: string }>
	searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
	return (
		<Suspense fallback={<Loading message="Loading achievements" />}>
			<PlayerAchievementsContent params={params} searchParams={searchParams} />
		</Suspense>
	)
}
