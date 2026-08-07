import Link from "next/link";
import type { ReactNode } from "react";
import { BlockPanel } from "@/components/ui/BlockPanel";
import { PixelButton } from "@/components/ui/PixelButton";

const PF = "font-[family-name:var(--font-pixel)]";

export function ErrorPanel({
	message,
	title = "Something went wrong",
	onRetry,
	retryLabel = "Try Again",
	showHome = true,
	digest,
	children,
	className = "",
}: {
	message?: ReactNode;
	title?: string;
	onRetry?: () => void;
	retryLabel?: string;
	showHome?: boolean;
	digest?: string;
	children?: ReactNode;
	className?: string;
}) {
	return (
		<BlockPanel
			variant="elevated"
			className={`flex flex-col items-center gap-4 py-10 px-6 text-center ${className}`}
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
				{title}
			</h2>

			{message !== undefined && (
				<p className="max-w-md text-sm text-foreground/90 leading-relaxed">
					{message}
				</p>
			)}

			{children}

			{(onRetry || showHome) && (
				<div className="mt-1 flex flex-wrap items-center justify-center gap-3">
					{onRetry && (
						<PixelButton
							variant="red"
							onClick={onRetry}
						>
							{retryLabel}
						</PixelButton>
					)}
					{showHome && (
						<Link
							href="/"
							className={`${PF} text-xs uppercase tracking-wider text-mc-stone-light hover:text-mc-gold transition-colors underline-offset-4 hover:underline`}
						>
							Back to Home
						</Link>
					)}
				</div>
			)}

			{digest && (
				<p className="mt-1 text-[0.65rem] text-mc-stone-light/70 break-all">
					Error ID: {digest}
				</p>
			)}
		</BlockPanel>
	);
}
