import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import Link from "next/link";
import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import "./globals.css";

const inter = Inter({
	variable: "--font-body",
	subsets: ["latin"],
	weight: ["400", "700"],
	display: "swap",
});

const minecraft = localFont({
	src: [
		{
			path: "./fonts/minecraft.woff2",
			weight: "400",
			style: "normal",
		},
		{
			path: "./fonts/minecraft.woff",
			weight: "400",
			style: "normal",
		},
	],
	variable: "--font-pixel",
	display: "swap",
	fallback: ["monospace"],
});

export const metadata: Metadata = {
	title: "Hypixel Achievements",
	description: "Browse, compare, and break down Hypixel player achievements",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${inter.variable} ${minecraft.variable}`}>
			<body className="min-h-dvh flex flex-col bg-background text-foreground font-sans antialiased">
				<Suspense
					fallback={
						<header className="w-full border-b-[3px] border-mc-border bg-mc-stone-dark shadow-[0_4px_0_rgba(0,0,0,0.28)]">
							<div className="w-full max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
								<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
									<Link
										href="/"
										className="inline-flex flex-col gap-1 w-fit"
									>
										<span className="font-display text-lg sm:text-xl text-mc-gold tracking-[0.08em] uppercase">
											Hypixel Achievements
										</span>
										<span className="text-xs sm:text-sm text-mc-stone-light">
											Browse, compare, and break down
											player achievements.
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
									</nav>
								</div>
							</div>
						</header>
					}
				>
					<SiteHeader />
				</Suspense>
				<main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
					{children}
				</main>
			</body>
		</html>
	);
}
