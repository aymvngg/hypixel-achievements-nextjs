'use client';

import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingFn,
  type SortingState,
} from '@tanstack/react-table';
import Image from 'next/image';
import type { AchievementView } from '@/lib/hypixel/types';
import { formatGameLabel, gameIconUrl } from '@/lib/util/games';

function formatPercent(value: number): string {
  return Number.isFinite(value) ? value.toFixed(1) : '0.0';
}

function formatReward(view: AchievementView): string {
  if (view.type === 'TIERED') {
    return `${view.obtainedPoints.toLocaleString()}/${view.totalPoints.toLocaleString()}`;
  }
  return view.totalPoints.toLocaleString();
}

const sortByReward: SortingFn<AchievementView> = (rowA, rowB) =>
  rowA.original.totalPoints - rowB.original.totalPoints;

const sortByUnlocked: SortingFn<AchievementView> = (rowA, rowB) =>
  rowA.original.globalPercentUnlocked - rowB.original.globalPercentUnlocked;

function NameCell({ view }: { view: AchievementView }) {
  return (
    <span className="font-[family-name:var(--font-pixel)] text-xs text-white leading-tight block">
      {view.name}
    </span>
  );
}

function GameIconCell({ view }: { view: AchievementView }) {
  const icon = gameIconUrl(view.game);
  if (!icon) return null;
  return (
    <Image
      src={icon}
      alt={formatGameLabel(view.game)}
      title={formatGameLabel(view.game)}
      width={20}
      height={20}
      className="inline-block"
      style={{ imageRendering: 'pixelated' }}
      unoptimized
    />
  );
}

function UnlockCell({ percent }: { percent: number }) {
  const safe = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
  const color = safe >= 50 ? 'text-mc-stone-light' : safe >= 10 ? 'text-mc-sky' : 'text-mc-gold';
  return (
    <span className={`font-[family-name:var(--font-pixel)] text-xs tabular-nums ${color}`}>
      {formatPercent(safe)}%
    </span>
  );
}

const tieredColumns: ColumnDef<AchievementView>[] = [
  {
    id: 'game',
    header: 'Game',
    accessorFn: (view) => view.game,
    meta: { width: 'w-[4%]' },
    cell: ({ row }) => <GameIconCell view={row.original} />,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    meta: { width: 'w-[28%]' },
    cell: ({ row }) => <NameCell view={row.original} />,
  },
  {
    accessorKey: 'description',
    header: 'Description',
    meta: { width: 'w-[36%]' },
    cell: ({ row }) => (
      <p className="text-white/90 leading-snug text-xs">
        {row.original.description}
      </p>
    ),
  },
  {
    id: 'tiers',
    header: 'Tiers',
    meta: { width: 'w-[16%]' },
    cell: ({ row }) => (
      <span className="font-[family-name:var(--font-pixel)] text-xs tabular-nums">
        {row.original.currentTier}
        <span className="text-mc-stone-light"> / {row.original.maxTier}</span>
      </span>
    ),
  },
  {
    id: 'reward',
    header: 'Reward',
    accessorFn: (view) => view.totalPoints,
    meta: { align: 'right', width: 'w-[16%]' },
    sortingFn: sortByReward,
    cell: ({ row }) => (
      <span className="font-[family-name:var(--font-pixel)] text-mc-grass text-xs tabular-nums">
        {formatReward(row.original)}
      </span>
    ),
  },
];

const oneTimeColumns: ColumnDef<AchievementView>[] = [
  {
    id: 'game',
    header: 'Game',
    accessorFn: (view) => view.game,
    meta: { width: 'w-[4%]' },
    cell: ({ row }) => <GameIconCell view={row.original} />,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    meta: { width: 'w-[28%]' },
    cell: ({ row }) => <NameCell view={row.original} />,
  },
  {
    accessorKey: 'description',
    header: 'Description',
    meta: { width: 'w-[36%]' },
    cell: ({ row }) => (
      <p className="text-white/90 leading-snug text-xs">
        {row.original.description}
      </p>
    ),
  },
  {
    id: 'reward',
    header: 'Reward',
    accessorFn: (view) => view.totalPoints,
    meta: { align: 'right', width: 'w-[16%]' },
    sortingFn: sortByReward,
    cell: ({ row }) => (
      <span className="font-[family-name:var(--font-pixel)] text-mc-grass text-xs tabular-nums">
        {formatReward(row.original)}
      </span>
    ),
  },
  {
    id: 'unlocked',
    header: 'Unlocked',
    accessorFn: (view) => view.globalPercentUnlocked,
    meta: { align: 'right', width: 'w-[16%]' },
    sortingFn: sortByUnlocked,
    cell: ({ row }) => <UnlockCell percent={row.original.globalPercentUnlocked} />,
  },
];

function AchievementDataTable({
  title,
  columns,
  views,
  emptyMessage,
}: {
  title: string;
  columns: ColumnDef<AchievementView>[];
  views: AchievementView[];
  emptyMessage: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'reward', desc: true }]);
  const [collapsed, setCollapsed] = useState(false);

  const table = useReactTable({
    data: views,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows = table.getRowModel().rows;

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
          <span className={`w-1.5 h-5 ${title === 'Tiered' ? 'bg-mc-sky' : 'bg-mc-gold'}`} aria-hidden />
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
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => {
                    const align = (header.column.columnDef.meta as { align?: string })?.align;
                    const width = (header.column.columnDef.meta as { width?: string })?.width;
                    const canSort = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        className={`text-left p-2.5 text-mc-stone-light font-[family-name:var(--font-pixel)] text-[0.7rem] uppercase tracking-[0.06em] whitespace-nowrap bg-mc-panel border-b-[3px] border-mc-border ${width ?? ''} ${
                          align === 'right' ? 'text-right' : ''
                        } ${canSort ? 'cursor-pointer select-none hover:text-mc-sky' : ''}`}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sorted === 'asc' ? ' ↑' : sorted === 'desc' ? ' ↓' : ''}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`${index % 2 === 0 ? 'bg-white/[0.025]' : 'bg-black/15'} hover:bg-mc-sky/10 ${
                    row.original.completed ? 'border-l-[3px] border-l-mc-grass' : ''
                  }`}
                  data-completed={row.original.completed ? 'true' : 'false'}
                >
                    {row.getVisibleCells().map((cell) => {
                      const align = (cell.column.columnDef.meta as { align?: string })?.align;
                      const width = (cell.column.columnDef.meta as { width?: string })?.width;
                      return (
                        <td
                          key={cell.id}
                          className={`align-middle p-2 border-b border-black/35 ${width ?? ''} ${
                            align === 'right' ? 'text-right' : ''
                          }`}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
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
  tieredViews,
  oneTimeViews,
}: {
  tieredViews: AchievementView[];
  oneTimeViews: AchievementView[];
}) {
  return (
    <div className="space-y-8 pb-2">
      <AchievementDataTable
        title="Tiered"
        columns={tieredColumns}
        views={tieredViews}
        emptyMessage="No tiered achievements match your filters."
      />
      <AchievementDataTable
        title="One-time"
        columns={oneTimeColumns}
        views={oneTimeViews}
        emptyMessage="No one-time achievements match your filters."
      />
    </div>
  );
}
