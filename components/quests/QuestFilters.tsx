"use client";

import { useEffect, useRef, useState } from "react";
import {
	QUEST_SORT_LABELS,
	type QuestSearchParams,
	type QuestSortField,
} from "@/lib/util/quest-filters";
import { useDebouncedCallback } from "@/lib/hooks/use-debounced-callback";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelIcon } from "@/components/ui/PixelIcon";

function isEditableTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	const tag = target.tagName;
	return (
		tag === "INPUT" ||
		tag === "TEXTAREA" ||
		tag === "SELECT" ||
		target.isContentEditable
	);
}

export function QuestFilters({
	params,
	onChange,
	onClear,
}: {
	params: QuestSearchParams;
	onChange: (updates: Partial<QuestSearchParams>) => void;
	onClear: () => void;
}) {
	const searchRef = useRef<HTMLInputElement>(null);
	const syncedSearch = params.search ?? "";
	const [searchInput, setSearchInput] = useState(syncedSearch);
	const [lastSynced, setLastSynced] = useState(syncedSearch);
	const [filtersOpen, setFiltersOpen] = useState(false);

	if (lastSynced !== syncedSearch) {
		setLastSynced(syncedSearch);
		setSearchInput(syncedSearch);
	}

	const hasActiveFilters = Boolean(
		params.type || params.status || params.sort || params.search,
	);

	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if (
				event.key !== "/" ||
				event.metaKey ||
				event.ctrlKey ||
				event.altKey
			)
				return;
			if (isEditableTarget(event.target)) return;
			event.preventDefault();
			searchRef.current?.focus();
		}

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, []);

	const debouncedSearch = useDebouncedCallback((value: string) => {
		const trimmed = value.trim();
		onChange({ search: trimmed || undefined });
	}, 300);

	function onSearchChange(value: string) {
		setSearchInput(value);
		debouncedSearch(value);
	}

	const effectiveDesc = params.sort ? (params.desc ?? false) : true;

	return (
		<div className="flex flex-wrap items-center gap-2 lg:pb-4 lg:border-b lg:border-mc-border/40">
			<div className="relative flex-1 min-w-0 sm:min-w-[12rem]">
				<span className="absolute left-3 top-1/2 -translate-y-1/2 text-mc-stone-light pointer-events-none select-none">
					<PixelIcon name="magnifier" className="h-3.5 w-3.5" />
				</span>
				<input
					ref={searchRef}
					name="search"
					type="search"
					placeholder="Search quests..."
					value={searchInput}
					onChange={(e) => onSearchChange(e.target.value)}
					className="rounded-sm w-full pl-9 pr-12 py-2 text-sm bg-mc-stone-dark text-foreground border-[3px] border-mc-border shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_0_rgba(255,255,255,0.05)] focus:outline-none focus:ring-2 focus:ring-mc-sky/30"
				/>
				<kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center px-1.5 py-0.5 text-[0.6rem] font-[family-name:var(--font-pixel)] text-mc-stone-light border border-mc-border/70 rounded-sm bg-mc-panel/80 pointer-events-none">
					/
				</kbd>
			</div>

			<PixelButton
				variant="stone"
				onClick={() => setFiltersOpen((v) => !v)}
				className="lg:hidden relative"
				aria-expanded={filtersOpen}
			>
				Filters
				{hasActiveFilters && (
					<span
						className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-mc-gold"
						aria-hidden
					/>
				)}
			</PixelButton>

			<div
				className={`${filtersOpen ? "flex" : "hidden"} lg:flex flex-wrap items-center gap-2 w-full lg:w-auto`}
			>
				<select
					aria-label="Quest type"
					value={params.type ?? ""}
					onChange={(e) =>
						onChange({
							type:
								e.target.value === "DAILY" ||
								e.target.value === "WEEKLY" ||
								e.target.value === "MONTHLY"
									? e.target.value
									: undefined,
						})
					}
					className="rounded-sm min-w-[8rem] px-2 py-2 text-sm bg-mc-stone-dark text-foreground border-[3px] border-mc-border shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_0_rgba(255,255,255,0.05)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mc-sky/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
				>
					<option value="">Any type</option>
					<option value="DAILY">Daily</option>
					<option value="WEEKLY">Weekly</option>
					<option value="MONTHLY">Monthly</option>
				</select>

				<select
					aria-label="Status"
					value={params.status ?? ""}
					onChange={(e) =>
						onChange({
							status:
								e.target.value === "active" ||
								e.target.value === "completed" ||
								e.target.value === "available"
									? e.target.value
									: undefined,
						})
					}
					className="rounded-sm min-w-[8rem] px-2 py-2 text-sm bg-mc-stone-dark text-foreground border-[3px] border-mc-border shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_0_rgba(255,255,255,0.05)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mc-sky/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
				>
					<option value="">Any status</option>
					<option value="active">Active</option>
					<option value="completed">Completed</option>
					<option value="available">Available</option>
				</select>

				<select
					aria-label="Sort by"
					value={params.sort ?? ""}
					onChange={(e) =>
						onChange({
							sort: (e.target.value as QuestSortField) || undefined,
						})
					}
					className="rounded-sm min-w-[8rem] px-2 py-2 text-sm bg-mc-stone-dark text-foreground border-[3px] border-mc-border shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_0_rgba(255,255,255,0.05)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mc-sky/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
				>
					<option value="">Closest to done</option>
					{(Object.keys(QUEST_SORT_LABELS) as QuestSortField[]).map(
						(key) => (
							<option key={key} value={key}>
								{QUEST_SORT_LABELS[key]}
							</option>
						),
					)}
				</select>

				<PixelButton
					variant="stone"
					onClick={() =>
						onChange({
							sort: params.sort ?? "progress",
							desc: !effectiveDesc,
						})
					}
					title={effectiveDesc ? "Sort descending" : "Sort ascending"}
				>
					{effectiveDesc ? "↓ Desc" : "↑ Asc"}
				</PixelButton>

				<PixelButton variant="red" onClick={onClear}>
					Clear
				</PixelButton>
			</div>
		</div>
	);
}
