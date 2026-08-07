"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { PlayerSearchInput } from "@/components/home/PlayerSearchInput";
import { PixelButton } from "@/components/ui/PixelButton";
import { validatePlayerQuery } from "@/lib/util/validate";

function getCurrentUsername(pathname: string): string | undefined {
	if (!pathname.startsWith("/player/")) return undefined;
	const segments = pathname.split("/").filter(Boolean);
	if (segments.length < 2) return undefined;
	return decodeURIComponent(segments[1]);
}

export function SiteHeader() {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const currentUsername = getCurrentUsername(pathname);
	const showPlayerSearch = pathname !== "/";

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const raw = formData.get("username");
		if (typeof raw !== "string") return;

		const query = validatePlayerQuery(raw);
		const currentQuery = searchParams.toString();
		const nextUrl = `/player/${encodeURIComponent(query)}/achievements${currentQuery ? `?${currentQuery}` : ""}`;
		router.push(nextUrl);
	}

	return (
		<header className="w-full border-b-[3px] border-mc-border bg-mc-stone-dark shadow-[0_4px_0_rgba(0,0,0,0.28)]">
			<div className="w-full max-w-6xl mx-auto px-4 py-3 sm:py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
					<Link href="/" className="inline-flex flex-col gap-1 w-fit">
						<span className="font-display text-lg sm:text-xl text-mc-gold tracking-[0.08em] uppercase">
							Hypixel Achievements
						</span>
						<span className="hidden sm:block text-xs lg:text-sm text-mc-stone-light">
							Browse, compare, and break down player achievements.
						</span>
					</Link>
					<nav className="flex flex-wrap items-center gap-2 text-xs font-display uppercase tracking-wider">
						<Link
							href="/"
							className="px-3 py-1.5 border-2 border-transparent text-mc-stone-light hover:text-mc-gold hover:border-mc-border/60 hover:bg-black/15 transition-colors"
						>
							Home
						</Link>
						<Link
							href="/compare"
							className="px-3 py-1.5 border-2 border-transparent text-mc-stone-light hover:text-mc-gold hover:border-mc-border/60 hover:bg-black/15 transition-colors"
						>
							Compare
						</Link>
						<Link
							href="/badge-preview"
							className="px-3 py-1.5 border-2 border-transparent text-mc-stone-light hover:text-mc-gold hover:border-mc-border/60 hover:bg-black/15 transition-colors"
						>
							Tags
						</Link>
					</nav>
				</div>

				{showPlayerSearch ? (
					<form
						onSubmit={handleSubmit}
						className="flex gap-2 w-full lg:w-auto lg:min-w-76"
					>
						<PlayerSearchInput
							key={currentUsername ?? "player-search"}
							defaultValue={currentUsername}
							autoFocus={false}
							placeholder="Switch player..."
							className="px-2.5 py-2 text-sm"
						/>
						<PixelButton
							type="submit"
							variant="grass"
							className="px-4 shrink-0"
						>
							Go
						</PixelButton>
					</form>
				) : null}
			</div>
		</header>
	);
}
