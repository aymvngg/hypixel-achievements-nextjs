'use client';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import type { CompareRow } from '@/lib/logic/compare';
import { formatGameLabel } from '@/lib/util/games';
import { BlockPanel } from '@/components/ui/BlockPanel';

function diffLabel(p1: number, p2: number, p1Short: string, p2Short: string): string {
  if (p1 > p2) return `${p1Short} +${(p1 - p2).toLocaleString()}`;
  if (p2 > p1) return `${p2Short} +${(p2 - p1).toLocaleString()}`;
  return 'Tie';
}

export function CompareTable({
  rows,
  metric,
  p1Short,
  p2Short,
}: {
  rows: CompareRow[];
  metric: 'obtained' | 'missing';
  p1Short: string;
  p2Short: string;
}) {
  const columns: ColumnDef<CompareRow>[] = [
    {
      accessorKey: 'game',
      header: 'Game',
      cell: ({ row }) => formatGameLabel(row.original.game),
    },
    {
      id: 'p1',
      header: p1Short,
      cell: ({ row }) => {
        const v =
          metric === 'obtained' ? row.original.p1Obtained : row.original.p1Missing;
        return v.toLocaleString();
      },
    },
    {
      id: 'p2',
      header: p2Short,
      cell: ({ row }) => {
        const v =
          metric === 'obtained' ? row.original.p2Obtained : row.original.p2Missing;
        return v.toLocaleString();
      },
    },
    {
      id: 'diff',
      header: 'Diff',
      cell: ({ row }) => {
        const p1 =
          metric === 'obtained' ? row.original.p1Obtained : row.original.p1Missing;
        const p2 =
          metric === 'obtained' ? row.original.p2Obtained : row.original.p2Missing;
        return diffLabel(p1, p2, p1Short, p2Short);
      },
    },
  ];

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (rows.length === 0) {
    return (
      <BlockPanel className="text-center text-mc-stone-light py-8">
        No achievements to compare.
      </BlockPanel>
    );
  }

  return (
    <BlockPanel className="overflow-x-auto">
      <table className="mc-table w-full border-collapse min-w-[480px]">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b-2 border-mc-border">
              {hg.headers.map((header) => (
                <th key={header.id} className="text-left p-2 text-mc-gold">
                  {flexRender(header.column.columnDef.header, header.getContext())}
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
      </table>
    </BlockPanel>
  );
}
