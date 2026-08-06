'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PixelImg } from '@/components/ui/PixelImg';
import type { AchievementView } from '@/lib/hypixel/types';
import type { AchievementSearchParams } from '@/lib/search-params';
import { playerAchievementsHref } from '@/lib/search-params';
import { formatGameLabel, gameIconUrl } from '@/lib/util/games';
import type { SortField } from '@/lib/util/validate';

const NF = new Intl.NumberFormat('en-US');

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

function sortHref(
  username: string,
  params: AchievementSearchParams,
  field: SortField,
): string {
  const current = effectiveSort(params);
  const nextDesc = current.field === field ? !current.desc : DEFAULT_DESC;
  return playerAchievementsHref(username, params, { sort: field, desc: nextDesc });
}

const TH =
  'text-mc-stone-light font-[family-name:var(--font-pixel)] text-[0.7rem] uppercase tracking-[0.06em] whitespace-nowrap bg-mc-panel border-b-[3px] border-mc-border';

function SortableHeader({
  username,
  params,
  field,
  label,
  align = 'left',
  width,
}: {
  username: string;
  params: AchievementSearchParams;
  field: SortField;
  label: string;
  align?: 'left' | 'right';
  width: string;
}) {
  const { field: activeField, desc } = effectiveSort(params);
  const active = activeField === field;
  return (
    <th className={`p-0 ${width} ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <Link
        href={sortHref(username, params, field)}
        scroll={false}
        className={`block w-full p-2.5 cursor-pointer select-none hover:text-mc-sky ${TH} ${
          align === 'right' ? 'text-right' : 'text-left'
        }`}
      >
        {label}
        {active ? (desc ? ' ↓' : ' ↑') : ''}
      </Link>
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

function AchievementTable({
  title,
  views,
  variant,
  emptyMessage,
  username,
  params,
}: {
  title: string;
  views: AchievementView[];
  variant: 'tiered' | 'one-time';
  emptyMessage: string;
  username: string;
  params: AchievementSearchParams;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const completedCount = views.filter((v) => v.completed).length;
  const pct = views.length > 0 ? ((completedCount / views.length) * 100).toFixed(1) : '0.0';

  return (
    <section className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
        aria-controls={`${title.toLowerCase()}-table`}
        className="flex items-center justify-between gap-3 px-0.5 w-full text-left"
      >
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-5 ${variant === 'tiered' ? 'bg-mc-sky' : 'bg-mc-gold'}`} aria-hidden />
          <h2 className="font-[family-name:var(--font-pixel)] text-base tracking-[0.06em] text-mc-sky">{title}</h2>
          <span
            className={`text-xs text-mc-stone-light font-[family-name:var(--font-pixel)] transition-transform ${
              collapsed ? 'rotate-90' : ''
            }`}
            aria-hidden
          >
            ▶
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-[family-name:var(--font-pixel)] text-[0.7rem] tracking-[0.04em] uppercase text-mc-stone-light px-2 py-0.5 rounded-sm border-2 border-mc-border bg-mc-stone-dark shadow-[inset_1px_1px_0_rgba(0,0,0,0.35)]">
            {completedCount}/{views.length}
          </span>
          <span className="text-[0.6rem] font-[family-name:var(--font-pixel)] text-mc-stone-light px-1.5 py-0.5 bg-mc-stone-dark border border-mc-border rounded-sm">
            {pct}%
          </span>
        </div>
      </button>

      {!collapsed && (
        <div
          className="rounded-sm border-[3px] border-mc-border bg-mc-stone-dark shadow-[inset_2px_2px_0_rgba(255,255,255,0.06),inset_-2px_-2px_0_rgba(0,0,0,0.25),4px_4px_0_rgba(0,0,0,0.35)]"
          id={`${title.toLowerCase()}-table`}
        >
          {views.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-2xl mb-2">📭</p>
              <p className="text-mc-stone-light text-sm font-[family-name:var(--font-pixel)]">
                {emptyMessage}
              </p>
            </div>
          ) : (
            <table className="w-full table-fixed border-collapse relative">
              <thead className="sticky top-0 z-10">
                  <tr>
                    <th className={`p-2.5 ${TH} w-[4%]`}>
                      <span className="sr-only">Game</span>
                    </th>
                    <SortableHeader
                      username={username}
                      params={params}
                      field="name"
                      label="Name"
                      width="w-[28%]"
                    />
                    <SortableHeader
                      username={username}
                      params={params}
                      field="progress"
                      label="Description"
                      width="w-[36%]"
                    />
                    {variant === 'tiered' ? (
                      <th className={`p-2.5 ${TH} w-[16%]`}>Tiers</th>
                    ) : (
                      <SortableHeader
                        username={username}
                        params={params}
                        field="global-pct"
                        label="Unlocked"
                        align="right"
                        width="w-[16%]"
                      />
                    )}
                    <SortableHeader
                      username={username}
                      params={params}
                      field="points"
                      label="Reward"
                      align="right"
                      width="w-[16%]"
                    />
                  </tr>
                </thead>
                <tbody>
                  {views.map((view, index) => (
                    <AchievementRow key={`${view.game}-${view.codeName}`} view={view} index={index} />
                  ))}
                </tbody>
              </table>
          )}
        </div>
      )}
    </section>
  );
}

export function AchievementTables({
  username,
  params,
  tieredViews,
  oneTimeViews,
}: {
  username: string;
  params: AchievementSearchParams;
  tieredViews: AchievementView[];
  oneTimeViews: AchievementView[];
}) {
  return (
    <div className="space-y-8 pb-2">
      <AchievementTable
        title="Tiered"
        variant="tiered"
        views={tieredViews}
        emptyMessage="No tiered achievements match your filters."
        username={username}
        params={params}
      />
      <AchievementTable
        title="One-time"
        variant="one-time"
        views={oneTimeViews}
        emptyMessage="No one-time achievements match your filters."
        username={username}
        params={params}
      />
    </div>
  );
}
