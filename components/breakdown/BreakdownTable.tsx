'use client';

import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import type { GameBreakdownRow } from '@/lib/logic/breakdown';
import { formatGameLabel } from '@/lib/util/games';
import { BlockPanel } from '@/components/ui/BlockPanel';

function pct(obtained: number, total: number): string {
  if (total <= 0) return '0.0';
  return ((obtained / total) * 100).toFixed(1);
}

const columns: ColumnDef<GameBreakdownRow>[] = [
  {
    accessorKey: 'game',
    header: 'Game',
    cell: ({ row }) => formatGameLabel(row.original.game),
  },
  {
    accessorKey: 'obtained',
    header: 'Obtained',
    cell: ({ row }) => row.original.obtained.toLocaleString(),
  },
  {
    accessorKey: 'missing',
    header: 'Missing',
    cell: ({ row }) => row.original.missing.toLocaleString(),
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => row.original.total.toLocaleString(),
  },
  {
    id: 'completion',
    header: 'Done',
    cell: ({ row }) =>
      `${row.original.completed}/${row.original.count} (${pct(row.original.obtained, row.original.total)}%)`,
  },
];

export function BreakdownTable({
  rows,
  totals,
}: {
  rows: GameBreakdownRow[];
  totals: { obtained: number; missing: number; total: number };
}) {
  const [sorting, setSorting] = useState([{ id: 'obtained', desc: true }]);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
  });

  return (
    <BlockPanel className="overflow-x-auto">
      <table className="mc-table w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b-2 border-mc-border">
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="text-left p-2 text-mc-gold cursor-pointer select-none"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() === 'asc' ? ' ↑' : ''}
                  {header.column.getIsSorted() === 'desc' ? ' ↓' : ''}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-mc-border/50 hover:bg-mc-stone-dark/50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-mc-border font-bold text-mc-gold">
            <td className="p-2">Total</td>
            <td className="p-2">{totals.obtained.toLocaleString()}</td>
            <td className="p-2">{totals.missing.toLocaleString()}</td>
            <td className="p-2">{totals.total.toLocaleString()}</td>
            <td className="p-2">{pct(totals.obtained, totals.total)}%</td>
          </tr>
        </tfoot>
      </table>
    </BlockPanel>
  );
}
