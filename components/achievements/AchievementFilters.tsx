'use client';

import { useState } from 'react';
import type { AchievementStatus, SortField } from '@/lib/util/validate';
import { SORT_LABELS } from '@/lib/search-params';
import type { AchievementSearchParams } from '@/lib/search-params';
import { useDebouncedCallback } from '@/lib/hooks/use-debounced-callback';
import { PixelButton } from '@/components/ui/PixelButton';

export function AchievementFilters({
  params,
  setParams,
  clearParams,
}: {
  params: AchievementSearchParams;
  setParams: (updates: Partial<AchievementSearchParams>) => void;
  clearParams: () => void;
}) {
  const syncedSearch = params.search ?? '';
  const [searchInput, setSearchInput] = useState(syncedSearch);
  const [lastSynced, setLastSynced] = useState(syncedSearch);

  if (lastSynced !== syncedSearch) {
    setLastSynced(syncedSearch);
    setSearchInput(syncedSearch);
  }

  const debouncedSearch = useDebouncedCallback((value: string) => {
    const trimmed = value.trim();
    setParams({ search: trimmed || undefined });
  }, 300);

  function onSearchChange(value: string) {
    setSearchInput(value);
    debouncedSearch(value);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-mc-border/40">
      <div className="relative flex-1 min-w-[12rem]">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mc-stone-light text-sm pointer-events-none select-none">
          🔍
        </span>
        <input
          name="search"
          type="search"
          placeholder="Search achievements..."
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          className="rounded-sm w-full pl-9 pr-3 py-2 text-sm bg-mc-stone-dark text-foreground border-[3px] border-mc-border shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_0_rgba(255,255,255,0.05)] focus:outline-none focus:ring-2 focus:ring-mc-sky/30"
        />
      </div>

      <select
        aria-label="Status"
        value={params.status ?? ''}
        onChange={(e) =>
          setParams({ status: (e.target.value as AchievementStatus) || undefined })
        }
        className="rounded-sm min-w-[8rem] px-2 py-2 text-sm bg-mc-stone-dark text-foreground border-[3px] border-mc-border shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_0_rgba(255,255,255,0.05)] cursor-pointer"
      >
        <option value="">Any status</option>
        <option value="completed">Completed</option>
        <option value="uncompleted">Uncompleted</option>
      </select>

      <select
        aria-label="Sort by"
        value={params.sort ?? ''}
        onChange={(e) =>
          setParams({ sort: (e.target.value as SortField) || undefined })
        }
        className="rounded-sm min-w-[8rem] px-2 py-2 text-sm bg-mc-stone-dark text-foreground border-[3px] border-mc-border shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_0_rgba(255,255,255,0.05)] cursor-pointer"
      >
        <option value="">Default sort</option>
        {(Object.keys(SORT_LABELS) as SortField[]).map((key) => (
          <option key={key} value={key}>
            {SORT_LABELS[key]}
          </option>
        ))}
      </select>

      <PixelButton
        variant="stone"
        onClick={() => setParams({ desc: !params.desc })}
        title={params.desc ? 'Sort descending' : 'Sort ascending'}
      >
        {params.desc ? '↓ Desc' : '↑ Asc'}
      </PixelButton>

      <PixelButton variant="red" onClick={clearParams}>
        Clear
      </PixelButton>
    </div>
  );
}
