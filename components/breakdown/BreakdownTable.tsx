import { PixelImg } from '@/components/ui/PixelImg';
import type { GameBreakdownRow } from '@/lib/logic/breakdown';
import { formatGameLabel, gameIconUrl } from '@/lib/util/games';

function pct(obtained: number, total: number): string {
  if (total <= 0) return '0.0';
  return ((obtained / total) * 100).toFixed(1);
}

function GameCard({ row }: { row: GameBreakdownRow }) {
  const icon = gameIconUrl(row.game);
  const percent = row.total > 0 ? Math.min(100, (row.obtained / row.total) * 100) : 0;

  return (
    <div className="flex overflow-hidden rounded-sm border-[3px] border-mc-border bg-mc-stone-dark shadow-[inset_2px_2px_0_rgba(255,255,255,0.06),inset_-2px_-2px_0_rgba(0,0,0,0.25),4px_4px_0_rgba(0,0,0,0.35)]">
      <div className="shrink-0 flex bg-mc-panel border-r-[3px] border-mc-border">
        {icon && (
          <PixelImg
            src={icon}
            alt={formatGameLabel(row.game)}
            width={64}
            height={64}
            className="block h-full w-auto"
          />
        )}
      </div>

      <div className="flex-1 min-w-0 p-3 space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-[family-name:var(--font-pixel)] text-white text-sm truncate">
            {formatGameLabel(row.game)}
          </h3>
          <span className="font-[family-name:var(--font-pixel)] text-mc-sky text-sm tabular-nums shrink-0">
            {pct(row.obtained, row.total)}%
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-mc-grass font-bold tabular-nums">
            {row.obtained.toLocaleString()}
          </span>
          <span className="text-mc-stone-light">obtained</span>
          <span className="text-mc-red tabular-nums ml-auto">
            {row.missing.toLocaleString()}
          </span>
          <span className="text-mc-stone-light">missing</span>
        </div>

        <div className="h-3 rounded-sm overflow-hidden bg-black/40 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.5)]">
          <div className="h-full bg-mc-grass" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
}

export function BreakdownTable({
  rows,
}: {
  rows: GameBreakdownRow[];
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {rows.map((row) => (
        <GameCard key={row.game} row={row} />
      ))}
    </div>
  );
}
