import type { Metadata } from "next";
import { Suspense } from "react";
import { PlayerQuestExplorer } from "@/components/quests/PlayerQuestExplorer";
import { QuestSummaryStrip } from "@/components/quests/QuestSummaryStrip";
import { PlayerHeader } from "@/components/player/PlayerHeader";
import { PlayerNav } from "@/components/layout/PlayerNav";
import { BlockPanel } from "@/components/ui/BlockPanel";
import { Loading } from "@/components/ui/Loading";
import { getPlayerPageData } from "@/lib/hypixel/player-data";
import { getPlayerQuestPageData } from "@/lib/hypixel/quest-data";
import { summarizeAchievementViews } from "@/lib/logic/achievement-stats";
import { summarizeQuestViews } from "@/lib/logic/quest-stats";
import { getDisplayName } from "@/lib/util/display";
import { formatError } from "@/lib/util/errors";
import { parseQuestSearchParams } from "@/lib/util/quest-filters";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ username: string }>;
}): Promise<Metadata> {
	const { username } = await params;
	const decoded = decodeURIComponent(username);
	try {
		const data = await getPlayerQuestPageData(decoded);
		const name = getDisplayName(data.player, decoded);
		return { title: `${name}'s Quests` };
	} catch {
		return { title: "Player Quests" };
	}
}

async function PlayerQuestsContent({
	params,
	searchParams,
}: {
	params: Promise<{ username: string }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const { username } = await params;
	const decoded = decodeURIComponent(username);
	const filterParams = parseQuestSearchParams(await searchParams);

	let achData;
	let questData;
	try {
		[achData, questData] = await Promise.all([
			getPlayerPageData(decoded),
			getPlayerQuestPageData(decoded),
		]);
	} catch (err) {
		return (
			<BlockPanel className="text-center py-12 text-mc-red">
				{formatError(err)}
			</BlockPanel>
		);
	}

	const achSummary = summarizeAchievementViews(achData.views);
	const questSummary = summarizeQuestViews(questData.views);

	return (
		<div className="space-y-4">
			<PlayerHeader
				player={questData.player}
				query={decoded}
				summary={achSummary}
			/>
			<PlayerNav username={decoded} activeSection="quests" />
			<QuestSummaryStrip summary={questSummary} />
			<PlayerQuestExplorer
				key={decoded}
				initialParams={filterParams}
				views={questData.views}
				games={questData.games}
			/>
		</div>
	);
}

export default function PlayerQuestsPage({
	params,
	searchParams,
}: {
	params: Promise<{ username: string }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	return (
		<Suspense fallback={<Loading message="Loading quests" />}>
			<PlayerQuestsContent params={params} searchParams={searchParams} />
		</Suspense>
	);
}
