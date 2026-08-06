import Link from "next/link";
import { PlayerSearch } from "@/components/home/PlayerSearch";
import { BlockPanel } from "@/components/ui/BlockPanel";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelImg } from "@/components/ui/PixelImg";
import { ALL_GAME_KEYS, formatGameLabel, gameIconUrl } from "@/lib/util/games";

const features = [
	{
		title: "Explore",
		body: "Filter and sort every achievement by game, type, status, and reward.",
	},
	{
		title: "Break down",
		body: "See obtained vs missing AP for each game on one clean table.",
	},
	{
		title: "Compare",
		body: "Head-to-head AP comparison between any two players.",
	},
];

export default async function HomePage() {
	"use cache";

	const gameKeys = ALL_GAME_KEYS.filter(
		(k) => k !== "general" && k !== "skyclash",
	);

	return (
		<div className="space-y-8 py-8">
			<PlayerSearch />

			<div className="max-w-3xl mx-auto">
				<p className="text-center text-xs font-[family-name:var(--font-pixel)] uppercase text-mc-stone-light tracking-wider mb-3">
					Every Hypixel game, tracked
				</p>
				<div className="flex flex-wrap justify-center gap-2">
					{gameKeys.map((key) => {
						const icon = gameIconUrl(key);
						if (!icon) return null;
						return (
							<span
								key={key}
								title={formatGameLabel(key)}
								className="flex items-center gap-1.5 px-2 py-1 rounded-sm border-2 border-mc-border bg-mc-stone-dark"
							>
								<PixelImg
									src={icon}
									alt=""
									width={16}
									height={16}
									className="shrink-0"
								/>
								<span className="text-[0.65rem] font-[family-name:var(--font-pixel)] text-foreground">
									{formatGameLabel(key)}
								</span>
							</span>
						);
					})}
				</div>
			</div>

			<div className="text-center">
				<Link href="/compare">
					<PixelButton variant="stone" className="px-6">
						Compare Two Players
					</PixelButton>
				</Link>
			</div>
		</div>
	);
}
