'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { PixelImg } from '@/components/ui/PixelImg';
import type { AchievementView } from '@/lib/hypixel/types';
import type { AchievementSearchParams } from '@/lib/search-params';
import { formatGameLabel, gameIconUrl } from '@/lib/util/games';
import type { SortField } from '@/lib/util/validate';
import { CollapsibleSection } from '@/components/achievements/CollapsibleSection';

const NF = new Intl.NumberFormat('en-US');
const VIRTUALIZE_THRESHOLD = 40;
const ROW_ESTIMATE_PX = 52;

const DEFAULT_SORT: SortField = 'points';
const DEFAULT_DESC = true;

function formatPercent(value: number): string {
  return Number.isFinite(value) ? value.toFixed(1) : '0.0';
}

function formatReward(view: AchievementView): string {
  if (view.type === 'TIERED') {
    return `${NF.format(view.obtainedPoints)}/${NF.format(view.totalPoints)}`;
  }
  return NF.format(view.totalPoints);
}

function effectiveSort(params: AchievementSearchParams): { field: SortField; desc: boolean } {
  return {
    field: params.sort ?? DEFAULT_SORT,
    desc: params.sort ? (params.desc ?? false) : DEFAULT_DESC,
  };
}

const TH =
  'text-mc-stone-light font-[family-name:var(--font-pixel)] text-[0.7rem] uppercase tracking-[0.06em] whitespace-nowrap bg-mc-panel border-b-[3px] border-mc-border';

function SortableHeader({
  params,
  field,
  label,
  align = 'left',
  width,
  onSort,
}: {
  params: AchievementSearchParams;
  field: SortField;
  label: string;
  align?: 'left' | 'right';
  width: string;
  onSort: (updates: Partial<AchievementSearchParams>) => void;
}) {
  const { field: activeField, desc } = effectiveSort(params);
  const active = activeField === field;
  const ariaSort = active ? (desc ? 'descending' : 'ascending') : 'none';

  function handleClick() {
    const current = effectiveSort(params);
    const nextDesc = current.field === field ? !current.desc : DEFAULT_DESC;
    onSort({ sort: field, desc: nextDesc });
  }

  return (
    <th
      className={`p-0 ${width} ${align === 'right' ? 'text-right' : 'text-left'}`}
      aria-sort={ariaSort}
    >
      <button
        type="button"
        onClick={handleClick}
        aria-label={`Sort by ${label}`}
        className={`block w-full p-2.5 cursor-pointer select-none hover:text-mc-sky ${TH} ${
          align === 'right' ? 'text-right' : 'text-left'
        }`}
      >
        {label}
        {active ? (desc ? ' ↓' : ' ↑') : ''}
      </button>
    </th>
  );
}

function AchievementRow({ view, index }: { view: AchievementView; index: number }) {
  const icon = gameIconUrl(view.game);
  const unlockPct = Number.isFinite(view.globalPercentUnlocked)
    ? Math.min(100, Math.max(0, view.globalPercentUnlocked))
    : 0;
  const unlockColor =
    unlockPct >= 50 ? 'text-mc-stone-light' : unlockPct >= 10 ? 'text-mc-sky' : 'text-mc-gold';

  return (
    <tr
      className={`${index % 2 === 0 ? 'bg-white/[0.025]' : 'bg-black/15'} hover:bg-mc-sky/10 ${
        view.completed ? 'border-l-[3px] border-l-mc-grass' : ''
      }`}
      data-completed={view.completed ? 'true' : 'false'}
    >
      <td className="align-middle p-2 border-b border-black/35 w-[4%]">
        {icon && (
          <PixelImg
            src={icon}
            alt={formatGameLabel(view.game)}
            title={formatGameLabel(view.game)}
            width={20}
            height={20}
            className="inline-block"
          />
        )}
      </td>
      <td className="align-middle p-2 border-b border-black/35 w-[28%]">
        <span className="font-[family-name:var(--font-pixel)] text-xs text-white leading-tight block">
          {view.name}
        </span>
      </td>
      <td className="align-middle p-2 border-b border-black/35 w-[36%]">
        <p className="text-white/90 leading-snug text-xs">{view.description}</p>
      </td>
      {view.type === 'TIERED' ? (
        <td className="align-middle p-2 border-b border-black/35 w-[16%]">
          <span className="font-[family-name:var(--font-pixel)] text-xs tabular-nums">
            {view.currentTier}
            <span className="text-mc-stone-light"> / {view.maxTier}</span>
          </span>
        </td>
      ) : (
        <td className="align-middle p-2 border-b border-black/35 w-[16%] text-right">
          <span className={`font-[family-name:var(--font-pixel)] text-xs tabular-nums ${unlockColor}`}>
            {formatPercent(unlockPct)}%
          </span>
        </td>
      )}
      <td className="align-middle p-2 border-b border-black/35 w-[16%] text-right">
        <span className="font-[family-name:var(--font-pixel)] text-mc-grass text-xs tabular-nums">
          {formatReward(view)}
        </span>
      </td>
    </tr>
  );
}

function AchievementTableHead({
  params,
  variant,
  onSort,
}: {
  params: AchievementSearchParams;
  variant: 'tiered' | 'one-time';
  onSort: (updates: Partial<AchievementSearchParams>) => void;
}) {
  return (
    <thead className="sticky top-0 z-10">
      <tr>
        <th className={`p-2.5 ${TH} w-[4%]`}>
          <span className="sr-only">Game</span>
        </th>
        <SortableHeader params={params} field="name" label="Name" width="w-[28%]" onSort={onSort} />
        <SortableHeader
          params={params}
          field="progress"
          label="Description"
          width="w-[36%]"
          onSort={onSort}
        />
        {variant === 'tiered' ? (
          <th className={`p-2.5 ${TH} w-[16%]`}>Tiers</th>
        ) : (
          <SortableHeader
            params={params}
            field="global-pct"
            label="Unlocked"
            align="right"
            width="w-[16%]"
            onSort={onSort}
          />
        )}
        <SortableHeader
          params={params}
          field="points"
          label="Reward"
          align="right"
          width="w-[16%]"
          onSort={onSort}
        />
      </tr>
    </thead>
  );
}

function VirtualizedAchievementTable({
  views,
  params,
  variant,
  onSort,
}: {
  views: AchievementView[];
  params: AchievementSearchParams;
  variant: 'tiered' | 'one-time';
  onSort: (updates: Partial<AchievementSearchParams>) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: views.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_ESTIMATE_PX,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0 ? rowVirtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end : 0;

  return (
    <div ref={scrollRef} className="max-h-[min(70vh,36rem)] overflow-auto">
      <table className="w-full table-fixed border-collapse relative">
        <AchievementTableHead params={params} variant={variant} onSort={onSort} />
        <tbody>
          {paddingTop > 0 && (
            <tr aria-hidden>
              <td colSpan={5} style={{ height: paddingTop, padding: 0, border: 'none' }} />
            </tr>
          )}
          {virtualRows.map((virtualRow) => {
            const view = views[virtualRow.index];
            return (
              <AchievementRow
                key={`${view.game}-${view.codeName}`}
                view={view}
                index={virtualRow.index}
              />
            );
          })}
          {paddingBottom > 0 && (
            <tr aria-hidden>
              <td colSpan={5} style={{ height: paddingBottom, padding: 0, border: 'none' }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function AchievementTable({
  title,
  views,
  variant,
  emptyMessage,
  params,
  onSort,
}: {
  title: string;
  views: AchievementView[];
  variant: 'tiered' | 'one-time';
  emptyMessage: string;
  params: AchievementSearchParams;
  onSort: (updates: Partial<AchievementSearchParams>) => void;
}) {
  const completedCount = views.filter((v) => v.completed).length;
  const tableId = `${title.toLowerCase()}-table`;
  const virtualize = views.length >= VIRTUALIZE_THRESHOLD;

  return (
    <CollapsibleSection
      title={title}
      variant={variant}
      completedCount={completedCount}
      totalCount={views.length}
      tableId={tableId}
      storageKey={`achievement-collapse-${variant}`}
    >
      {views.length === 0 ? (
        <div className="text-center py-12 px-4">
          <p className="text-2xl mb-2">📭</p>
          <p className="text-mc-stone-light text-sm font-[family-name:var(--font-pixel)]">
            {emptyMessage}
          </p>
        </div>
      ) : virtualize ? (
        <VirtualizedAchievementTable
          views={views}
          params={params}
          variant={variant}
          onSort={onSort}
        />
      ) : (
        <table className="w-full table-fixed border-collapse relative">
          <AchievementTableHead params={params} variant={variant} onSort={onSort} />
          <tbody>
            {views.map((view, index) => (
              <AchievementRow key={`${view.game}-${view.codeName}`} view={view} index={index} />
            ))}
          </tbody>
        </table>
      )}
    </CollapsibleSection>
  );
}

export function AchievementTables({
  params,
  tieredViews,
  oneTimeViews,
  onSort,
}: {
  params: AchievementSearchParams;
  tieredViews: AchievementView[];
  oneTimeViews: AchievementView[];
  onSort: (updates: Partial<AchievementSearchParams>) => void;
}) {
  return (
    <div className="space-y-8 pb-2">
      <AchievementTable
        title="Tiered"
        variant="tiered"
        views={tieredViews}
        emptyMessage="No tiered achievements match your filters."
        params={params}
        onSort={onSort}
      />
      <AchievementTable
        title="One-time"
        variant="one-time"
        views={oneTimeViews}
        emptyMessage="No one-time achievements match your filters."
        params={params}
        onSort={onSort}
      />
    </div>
  );
}
