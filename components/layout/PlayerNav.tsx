import Link from "next/link";
import { PixelIcon } from "@/components/ui/PixelIcon";

export function PlayerNav({
	username,
	activeSection,
}: {
	username: string;
	activeSection: "achievements" | "breakdown" | "quests";
}) {
	const encoded = encodeURIComponent(username);
	const base = `/player/${encoded}`;

	return (
		<nav
			className="flex items-center gap-1 border-2 border-mc-border bg-mc-stone-dark p-1 rounded-sm w-fit"
			aria-label="Player sections"
		>
			<Link
				href={`${base}/achievements`}
				aria-current={
					activeSection === "achievements" ? "page" : undefined
				}
				className={`px-3 py-1.5 text-xs font-[family-name:var(--font-pixel)] uppercase rounded-sm transition-colors inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mc-sky/60 focus-visible:ring-offset-2 focus-visible:ring-offset-mc-stone-dark ${
					activeSection === "achievements"
						? "bg-mc-grass text-white"
						: "text-mc-stone-light hover:text-foreground"
				}`}
			>
				<PixelIcon name="trophy" className="h-3 w-3" />
				Achievements
			</Link>
			<Link
				href={`${base}/breakdown`}
				aria-current={
					activeSection === "breakdown" ? "page" : undefined
				}
				className={`px-3 py-1.5 text-xs font-[family-name:var(--font-pixel)] uppercase rounded-sm transition-colors inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mc-sky/60 focus-visible:ring-offset-2 focus-visible:ring-offset-mc-stone-dark ${
					activeSection === "breakdown"
						? "bg-mc-grass text-white"
						: "text-mc-stone-light hover:text-foreground"
				}`}
			>
				<PixelIcon name="chart" className="h-3 w-3" />
				Breakdown
			</Link>
			<Link
				href={`${base}/quests`}
				aria-current={
					activeSection === "quests" ? "page" : undefined
				}
				className={`px-3 py-1.5 text-xs font-[family-name:var(--font-pixel)] uppercase rounded-sm transition-colors inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mc-sky/60 focus-visible:ring-offset-2 focus-visible:ring-offset-mc-stone-dark ${
					activeSection === "quests"
						? "bg-mc-grass text-white"
						: "text-mc-stone-light hover:text-foreground"
				}`}
			>
				<PixelIcon name="scroll" className="h-3 w-3" />
				Quests
			</Link>
		</nav>
	);
}
