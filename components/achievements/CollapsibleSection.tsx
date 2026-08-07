"use client";

import { useState, type ReactNode } from "react";

function readStoredCollapse(storageKey: string, fallback: boolean): boolean {
	try {
		const stored = sessionStorage.getItem(storageKey);
		if (stored === "true") return true;
		if (stored === "false") return false;
	} catch {
		// Ignore unavailable sessionStorage.
	}
	return fallback;
}

export function CollapsibleSection({
	title,
	variant,
	completedCount,
	totalCount,
	tableId,
	defaultCollapsed = false,
	storageKey,
	children,
}: {
	title: string;
	variant: "tiered" | "one-time";
	completedCount: number;
	totalCount: number;
	tableId: string;
	defaultCollapsed?: boolean;
	storageKey?: string;
	children: ReactNode;
}) {
	const [collapsed, setCollapsed] = useState(() =>
		storageKey
			? readStoredCollapse(storageKey, defaultCollapsed)
			: defaultCollapsed,
	);
	const pct =
		totalCount > 0
			? ((completedCount / totalCount) * 100).toFixed(1)
			: "0.0";

	function toggleCollapsed() {
		setCollapsed((current) => {
			const next = !current;
			if (storageKey) {
				try {
					sessionStorage.setItem(storageKey, String(next));
				} catch {
					// Ignore unavailable sessionStorage.
				}
			}
			return next;
		});
	}

	return (
		<section className="flex flex-col gap-2">
			<button
				type="button"
				onClick={toggleCollapsed}
				aria-expanded={!collapsed}
				aria-controls={tableId}
				className="flex items-center justify-between gap-3 px-0.5 w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mc-sky/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
			>
				<div className="flex items-center gap-2">
					<span
						className={`w-1.5 h-5 ${variant === "tiered" ? "bg-mc-sky" : "bg-mc-gold"}`}
						aria-hidden
					/>
					<h2 className="font-[family-name:var(--font-pixel)] text-base tracking-[0.06em] text-mc-sky">
						{title}
					</h2>
					<span
						className={`text-xs text-mc-stone-light font-[family-name:var(--font-pixel)] transition-transform ${
							collapsed ? "rotate-90" : ""
						}`}
						aria-hidden
					>
						▶
					</span>
				</div>
				<div className="flex items-center gap-2">
					<span className="font-[family-name:var(--font-pixel)] text-[0.7rem] tracking-[0.04em] uppercase text-mc-stone-light px-2 py-0.5 rounded-sm border-2 border-mc-border bg-mc-stone-dark shadow-[inset_1px_1px_0_rgba(0,0,0,0.35)]">
						{completedCount}/{totalCount}
					</span>
					<span className="text-[0.6rem] font-[family-name:var(--font-pixel)] text-mc-stone-light px-1.5 py-0.5 bg-mc-stone-dark border border-mc-border rounded-sm">
						{pct}%
					</span>
				</div>
			</button>

			{!collapsed && (
				<div
					className="rounded-sm border-[3px] border-mc-border bg-mc-stone-dark shadow-[inset_2px_2px_0_rgba(255,255,255,0.06),inset_-2px_-2px_0_rgba(0,0,0,0.25),4px_4px_0_rgba(0,0,0,0.35)]"
					id={tableId}
				>
					{children}
				</div>
			)}
		</section>
	);
}
