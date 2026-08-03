'use client';

import { useRouter, usePathname } from 'next/navigation';
import type { AchievementStatus, AchievementType, SortField } from '@/lib/util/validate';
import { SORT_LABELS } from '@/lib/search-params';
import { buildAchievementSearchParams, type AchievementSearchParams } from '@/lib/search-params';
import { PixelButton } from '@/components/ui/PixelButton';
import { BlockPanel } from '@/components/ui/BlockPanel';

export function AchievementFilters({
  games,
  params,
}: {
  games: string[];
  params: AchievementSearchParams;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function update(updates: Partial<AchievementSearchParams>) {
    const next = buildAchievementSearchParams(params, { ...updates, page: 1 });
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function clearFilters() {
    router.push(pathname);
  }

  return (
    <BlockPanel className="space-y-3">
      <div className="flex flex-wrap gap-2 items-end">
        <label className="flex flex-col gap-1 text-xs font-[family-name:var(--font-pixel)] uppercase">
          Game
          <select
            value={params.game ?? ''}
            onChange={(e) => update({ game: e.target.value || undefined })}
            className="mc-block-inset px-2 py-1.5 text-sm bg-mc-stone-dark text-foreground min-w-[140px]"
          >
            <option value="">All games</option>
            {games.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-[family-name:var(--font-pixel)] uppercase">
          Type
          <select
            value={params.type ?? ''}
            onChange={(e) =>
              update({ type: (e.target.value as AchievementType) || undefined })
            }
            className="mc-block-inset px-2 py-1.5 text-sm bg-mc-stone-dark text-foreground"
          >
            <option value="">Any</option>
            <option value="one-time">One-time</option>
            <option value="tiered">Tiered</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-[family-name:var(--font-pixel)] uppercase">
          Status
          <select
            value={params.status ?? ''}
            onChange={(e) =>
              update({ status: (e.target.value as AchievementStatus) || undefined })
            }
            className="mc-block-inset px-2 py-1.5 text-sm bg-mc-stone-dark text-foreground"
          >
            <option value="">Any</option>
            <option value="completed">Completed</option>
            <option value="uncompleted">Uncompleted</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-[family-name:var(--font-pixel)] uppercase">
          Sort
          <select
            value={params.sort ?? ''}
            onChange={(e) =>
              update({ sort: (e.target.value as SortField) || undefined })
            }
            className="mc-block-inset px-2 py-1.5 text-sm bg-mc-stone-dark text-foreground"
          >
            <option value="">Default</option>
            {(Object.keys(SORT_LABELS) as SortField[]).map((key) => (
              <option key={key} value={key}>{SORT_LABELS[key]}</option>
            ))}
          </select>
        </label>

        <PixelButton
          variant="stone"
          onClick={() => update({ desc: !params.desc })}
          className="self-end"
        >
          {params.desc ? 'Sort ↓' : 'Sort ↑'}
        </PixelButton>

        <PixelButton variant="red" onClick={clearFilters} className="self-end">
          Clear
        </PixelButton>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const search = (fd.get('search') as string)?.trim();
          update({ search: search || undefined });
        }}
        className="flex gap-2"
      >
        <input
          name="search"
          type="search"
          placeholder="Search by name..."
          defaultValue={params.search ?? ''}
          className="mc-block-inset flex-1 px-3 py-2 text-sm bg-mc-stone-dark text-foreground"
        />
        <PixelButton type="submit" variant="grass">Search</PixelButton>
      </form>
    </BlockPanel>
  );
}
