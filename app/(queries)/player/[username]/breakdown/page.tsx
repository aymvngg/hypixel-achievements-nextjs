import type { Metadata } from "next";
import { Suspense } from "react";
import { BreakdownTable } from "@/components/breakdown/BreakdownTable";
import { PlayerHeader } from "@/components/player/PlayerHeader";
import { PlayerNav } from "@/components/layout/PlayerNav";
import { ErrorPanel } from "@/components/ui/ErrorPanel";
import { Loading } from "@/components/ui/Loading";
import { getPlayerPageData } from "@/lib/hypixel/player-data";
import { computeGameBreakdown, sortGameBreakdown } from "@/lib/logic/breakdown";
import { summarizeAchievementViews } from "@/lib/logic/achievement-stats";
import { getDisplayName } from "@/lib/util/display";
import { formatError } from "@/lib/util/errors";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ username: string }>;
}): Promise<Metadata> {
	const { username } = await params;
	const decoded = decodeURIComponent(username);
	try {
		const data = await getPlayerPageData(decoded);
		const name = getDisplayName(data.player, decoded);
		return { title: `${name}'s Breakdown` };
	} catch {
		return { title: "Game Breakdown" };
	}
}

async function PlayerBreakdownContent({
	params,
}: {
	params: Promise<{ username: string }>;
}) {
	const { username } = await params;

	let result;
	try {
		const decoded = decodeURIComponent(username);
		const data = await getPlayerPageData(decoded);
		const rows = sortGameBreakdown(
			computeGameBreakdown(data.views),
			"obtained",
		);
		const summary = summarizeAchievementViews(data.views);
		result = { decoded, player: data.player, rows, summary };
	} catch (err) {
		return (
			<ErrorPanel
				title="Couldn't load breakdown"
				message={formatError(err)}
			/>
		);
	}

	const { decoded, player, rows, summary } = result;

	return (
		<div className="space-y-4">
			<PlayerHeader
				player={player}
				query={decoded}
				summary={summary}
			/>
			<PlayerNav username={decoded} activeSection="breakdown" />

			<div className="flex items-center gap-2 px-0.5">
				<span className="w-1.5 h-5 bg-mc-gold" aria-hidden />
				<h2 className="font-[family-name:var(--font-pixel)] text-base tracking-[0.06em] text-mc-sky">
					Game Breakdown
				</h2>
			</div>

			<BreakdownTable rows={rows} />
		</div>
	);
}

export default function PlayerBreakdownPage({
	params,
}: {
	params: Promise<{ username: string }>;
}) {
	return (
		<Suspense fallback={<Loading message="Loading breakdown" />}>
			<PlayerBreakdownContent params={params} />
		</Suspense>
	);
}
