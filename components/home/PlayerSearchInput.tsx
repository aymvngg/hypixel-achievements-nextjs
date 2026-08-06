"use client";

import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "@/lib/hooks/use-debounced-callback";

export function PlayerSearchInput({
	className = "",
	defaultValue,
	placeholder = "Enter Minecraft username...",
	autoFocus = true,
}: {
	className?: string;
	defaultValue?: string;
	placeholder?: string;
	autoFocus?: boolean;
}) {
	const router = useRouter();
	const prefetchPlayer = useDebouncedCallback((value: string) => {
		const trimmed = value.trim();
		if (trimmed) {
			router.prefetch(`/player/${encodeURIComponent(trimmed)}`);
		}
	}, 300);

	return (
		<input
			type="text"
			name="username"
			defaultValue={defaultValue}
			onChange={(e) => prefetchPlayer(e.target.value)}
			placeholder={placeholder}
			className={`rounded-sm flex-1 px-3 py-3 text-base bg-mc-stone-dark text-foreground border-[3px] border-mc-border shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_0_rgba(255,255,255,0.05)] ${className}`}
			autoFocus={autoFocus}
			required
		/>
	);
}
