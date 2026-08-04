import { PixelImg } from '@/components/ui/PixelImg';
import type { CompareRow } from '@/lib/logic/compare';
import type { PublicPlayerData } from '@/lib/hypixel/types';
import { formatGameLabel, gameIconUrl } from '@/lib/util/games';
import { playerHeadUrl } from '@/lib/util/playerHead';

const PF = 'font-[family-name:var(--font-pixel)]';
const PANEL =
  'rounded-sm border-[3px] border-mc-border bg-mc-stone-dark shadow-[inset_2px_2px_0_rgba(255,255,255,0.06),inset_-2px_-2px_0_rgba(0,0,0,0.25),4px_4px_0_rgba(0,0,0,0.35)]';

function PlayerSide({
  player,
  name,
  obtained,
  total,
  status,
  align,
}: {
  player: PublicPlayerData;
  name: string;
  obtained: number;
  total: number;
  status: 'win' | 'loss' | 'tie';
  align: 'left' | 'right';
}) {
  const pct = total > 0 ? (obtained / total) * 100 : 0;
  const right = align === 'right';
  const win = status === 'win';
  const headBorder = status === 'win' ? 'border-mc-grass' : status === 'loss' ? 'border-mc-red' : 'border-mc-border';
  return (
    <div className={`flex items-center gap-2 min-w-0 ${right ? 'flex-row-reverse' : ''}`}>
      <PixelImg
        src={playerHeadUrl(player.uuid, 40)}
        alt={name}
        width={40}
        height={40}
        className={`border-2 ${headBorder} rounded-sm shrink-0`}
      />
      <div className={`min-w-0 ${right ? 'text-right' : ''} flex-1`}>
        <p className={`${PF} text-xs uppercase tracking-wider truncate ${win ? 'text-mc-grass' : 'text-mc-stone-light'}`}>
          {name}
        </p>
        <p className={`${PF} text-sm tabular-nums ${win ? 'text-mc-grass' : 'text-mc-stone-light'}`}>
          {obtained.toLocaleString()} AP
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className={`flex-1 h-1.5 bg-black/40 border border-mc-border/60 overflow-hidden ${right ? 'flex-row-reverse flex' : ''}`}>
            <div className="h-full bg-mc-grass" style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
          <span className="text-[0.6rem] text-mc-stone-light tabular-nums shrink-0">{pct.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}

export function CompareGameCards({
  rows,
  p1,
  p2,
  p1Short,
  p2Short,
}: {
  rows: CompareRow[];
  p1: PublicPlayerData;
  p2: PublicPlayerData;
  p1Short: string;
  p2Short: string;
}) {
  if (rows.length === 0) {
    return (
      <div className={`${PANEL} text-center text-mc-stone-light py-8`}>No achievements to compare.</div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {rows.map((row) => {
        const icon = gameIconUrl(row.game);
        const cmp = row.p1Obtained - row.p2Obtained;
        const p1Status = cmp > 0 ? 'win' : cmp < 0 ? 'loss' : 'tie';
        const p2Status = cmp < 0 ? 'win' : cmp > 0 ? 'loss' : 'tie';
        return (
          <div key={row.game} className={`${PANEL} p-3`}>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <PlayerSide
                player={p1}
                name={p1Short}
                obtained={row.p1Obtained}
                total={row.p1Total}
                status={p1Status}
                align="left"
              />
              <div className="flex flex-col items-center gap-1 px-2 border-x-2 border-mc-border/50">
                {icon && (
                  <PixelImg src={icon} alt="" width={28} height={28} className="shrink-0" />
                )}
                <span className={`${PF} text-[0.65rem] text-mc-stone-light uppercase tracking-[0.03em] text-center leading-tight`}>
                  {formatGameLabel(row.game)}
                </span>
              </div>
              <PlayerSide
                player={p2}
                name={p2Short}
                obtained={row.p2Obtained}
                total={row.p2Total}
                status={p2Status}
                align="right"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
