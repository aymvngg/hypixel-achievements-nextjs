import Link from "next/link";
import { PlayerSearch } from "@/components/home/PlayerSearch";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelImg } from "@/components/ui/PixelImg";
import { ALL_GAME_KEYS, formatGameLabel, gameIconUrl } from "@/lib/util/games";

// Order the catalog by the games players actually search for most.
const FEATURED_ORDER = [
	"skywars",
	"bedwars",
	"skyblock",
	"duels",
	"buildbattle",
	"murdermystery",
];

export default async function HomePage() {
	"use cache";

	const gameKeys = ALL_GAME_KEYS.filter(
		(k) => k !== "general" && k !== "skyclash",
	);

	const featured = FEATURED_ORDER.filter((k) => gameKeys.includes(k));
	const rest = gameKeys
		.filter((k) => !FEATURED_ORDER.includes(k))
		.sort((a, b) => formatGameLabel(a).localeCompare(formatGameLabel(b)));

	return (
		<div className="space-y-10 py-8">
			<section aria-labelledby="lookup-heading">
				<h1
					id="lookup-heading"
					className="sr-only"
				>
					Look up a player
				</h1>
				<PlayerSearch />
			</section>

			<section className="max-w-4xl mx-auto" aria-labelledby="games-heading">
				<div className="flex items-center justify-between gap-4 mb-3 px-1">
					<h2
						id="games-heading"
						className="text-xs font-[family-name:var(--font-pixel)] uppercase text-mc-stone-light tracking-wider"
					>
						Every Hypixel game, tracked
					</h2>
				</div>

				<div className="flex flex-wrap justify-center gap-2">
					{featured.map((key) => {
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

				<details className="mt-3 group" aria-label="All tracked games">
					<summary className="cursor-pointer list-none w-fit mx-auto text-[0.65rem] font-[family-name:var(--font-pixel)] uppercase tracking-wider text-mc-stone-light hover:text-mc-gold transition-colors px-1 py-1">
						<span className="inline-flex items-center gap-1.5">
							<span className="transition-transform group-open:rotate-90 inline-block">
								▶
							</span>
							All {gameKeys.length} games
						</span>
					</summary>
					<div className="flex flex-wrap justify-center gap-2 mt-3">
						{rest.map((key) => {
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
				</details>
			</section>

			<section className="text-center" aria-label="Compare players">
				<div className="flex flex-col items-center gap-2">
					<Link href="/compare">
						<PixelButton variant="stone" className="px-6">
							Compare Two Players
						</PixelButton>
					</Link>
					<p className="text-xs font-[family-name:var(--font-pixel)] uppercase text-mc-stone-light tracking-wider">
						Head to head achievement totals
					</p>
				</div>
			</section>
		</div>
	);
}
