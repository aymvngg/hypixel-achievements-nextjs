import Link from "next/link";
import { BlockPanel } from "@/components/ui/BlockPanel";

const PF = "font-[family-name:var(--font-pixel)]";

/**
 * Friendly 429 panel shown when the per-IP or per-(IP, player) rate limit
 * is hit. Mirrors ErrorPanel's visual language.
 */
export function RateLimitPanel({
	retryAfterSec,
}: {
	retryAfterSec: number;
}) {
	const waitText =
		retryAfterSec > 0
			? `Please wait about ${Math.ceil(retryAfterSec / 60)} minute${
					Math.ceil(retryAfterSec / 60) === 1 ? "" : "s"
				} before trying again.`
			: "Please wait a moment before trying again.";

	return (
		<BlockPanel
			variant="elevated"
			className="flex flex-col items-center gap-4 py-10 px-6 text-center"
		>
			<div
				className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border-[3px] border-mc-border bg-mc-red/20 shadow-[inset_2px_2px_3px_rgba(0,0,0,0.4)]"
				aria-hidden
			>
				<svg
					viewBox="0 0 24 24"
					className="h-8 w-8 text-mc-red"
					fill="none"
					stroke="currentColor"
					strokeWidth={2.5}
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M12 9v4" />
					<path d="M12 17h.01" />
					<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
				</svg>
			</div>

			<h2
				className={`${PF} text-lg text-mc-red uppercase tracking-[0.06em]`}
			>
				Slow down!
			</h2>

			<p className="max-w-md text-sm text-foreground/90 leading-relaxed">
				You&apos;re making too many requests. {waitText}
			</p>

			<div className="mt-1 flex flex-wrap items-center justify-center gap-3">
				<Link
					href="/"
					className={`border-[3px] border-mc-border bg-mc-red text-white hover:brightness-110 shadow-[inset_2px_2px_0_rgba(255,255,255,0.12),inset_-2px_-2px_0_rgba(0,0,0,0.3),3px_3px_0_rgba(0,0,0,0.35)] ${PF} uppercase tracking-[0.02em] px-4 py-2 text-sm`}
				>
					Back to Home
				</Link>
				<Link
					href="/"
					className={`${PF} text-xs uppercase tracking-wider text-mc-stone-light hover:text-mc-gold transition-colors underline-offset-4 hover:underline`}
				>
					Retry
				</Link>
			</div>
		</BlockPanel>
	);
}
