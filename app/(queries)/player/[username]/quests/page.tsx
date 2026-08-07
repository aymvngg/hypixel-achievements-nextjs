import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import { PlayerQuestExplorer } from "@/components/quests/PlayerQuestExplorer";
import { QuestSummaryStrip } from "@/components/quests/QuestSummaryStrip";
import { PlayerHeader } from "@/components/player/PlayerHeader";
import { PlayerNav } from "@/components/layout/PlayerNav";
import { ErrorPanel } from "@/components/ui/ErrorPanel";
import { Loading } from "@/components/ui/Loading";
import { RateLimitPanel } from "@/components/ui/RateLimitPanel";
import { getPlayerQuestPageData } from "@/lib/hypixel/quest-data";
import { summarizeQuestViews } from "@/lib/logic/quest-stats";
import { getDisplayName } from "@/lib/util/display";
import { formatError } from "@/lib/util/errors";
import { parseQuestSearchParams } from "@/lib/util/quest-filters";
import { CLIENT_IP_HEADER } from "@/lib/ratelimit/ip";
import { isRateLimitError } from "@/lib/ratelimit/check";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ username: string }>;
}): Promise<Metadata> {
	const { username } = await params;
	const decoded = decodeURIComponent(username);
	try {
		const ip = (await headers()).get(CLIENT_IP_HEADER) ?? "unknown";
		const data = await getPlayerQuestPageData(decoded, ip);
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
	const sp = await searchParams;

	let result;
	try {
		const decoded = decodeURIComponent(username);
		const filterParams = parseQuestSearchParams(sp);
		const ip = (await headers()).get(CLIENT_IP_HEADER) ?? "unknown";
		const questData = await getPlayerQuestPageData(decoded, ip);
		const questSummary = summarizeQuestViews(questData.views);
		result = { decoded, filterParams, questData, questSummary };
	} catch (err) {
		if (isRateLimitError(err)) {
			return <RateLimitPanel retryAfterSec={err.retryAfterSec} />;
		}
		return (
			<ErrorPanel
				title="Couldn't load quests"
				message={formatError(err)}
			/>
		);
	}

	const { decoded, filterParams, questData, questSummary } =
		result;

	return (
		<div className="space-y-4">
			<PlayerHeader
				player={questData.player}
				query={decoded}
			/>
			<PlayerNav username={decoded} activeSection="quests" />
			<QuestSummaryStrip summary={questSummary} />
			<PlayerQuestExplorer
				key={decoded}
				initialParams={filterParams}
				views={questData.views}
				games={questData.games}
				counts={questData.counts}
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
