import type { Metadata } from 'next';
import { PixelImg } from '@/components/ui/PixelImg';
import { formatGameLabel, gameIconUrl } from '@/lib/util/games';
import type { CompareRow } from '@/lib/logic/compare';

export const metadata: Metadata = {
  title: 'Compare Design Showcase',
  robots: { index: false, follow: false },
};

const PF = 'font-[family-name:var(--font-pixel)]';
const PANEL =
  'rounded-sm border-[3px] border-mc-border bg-mc-stone-dark shadow-[inset_2px_2px_0_rgba(255,255,255,0.06),inset_-2px_-2px_0_rgba(0,0,0,0.25),4px_4px_0_rgba(0,0,0,0.35)]';

const P1 = { name: 'Steve', total: 18250, head: '🟦' };
const P2 = { name: 'Alex', total: 15670, head: '🟩' };

const ROWS: CompareRow[] = [
  { game: 'bedwars', p1Obtained: 8200, p2Obtained: 7800, p1Missing: 1000, p2Missing: 1400, p1Total: 9200, p2Total: 9200, p1Completed: 80, p2Completed: 70, p1Count: 100, p2Count: 100 },
  { game: 'skywars', p1Obtained: 4100, p2Obtained: 5200, p1Missing: 1900, p2Missing: 800, p1Total: 6000, p2Total: 6000, p1Completed: 40, p2Completed: 55, p1Count: 60, p2Count: 60 },
  { game: 'arcade', p1Obtained: 1500, p2Obtained: 1500, p1Missing: 500, p2Missing: 500, p1Total: 2000, p2Total: 2000, p1Completed: 30, p2Completed: 30, p1Count: 50, p2Count: 50 },
  { game: 'duels', p1Obtained: 3200, p2Obtained: 900, p1Missing: 300, p2Missing: 2600, p1Total: 3500, p2Total: 3500, p1Completed: 28, p2Completed: 8, p1Count: 30, p2Count: 30 },
  { game: 'murdermystery', p1Obtained: 700, p2Obtained: 1200, p1Missing: 800, p2Missing: 300, p1Total: 1500, p2Total: 1500, p1Completed: 12, p2Completed: 20, p1Count: 25, p2Count: 25 },
  { game: 'tntgames', p1Obtained: 550, p2Obtained: 470, p1Missing: 250, p2Missing: 330, p1Total: 800, p2Total: 800, p1Completed: 11, p2Completed: 9, p1Count: 16, p2Count: 16 },
];

function Head({ c, size = 32 }: { c: string; size?: number }) {
  return (
    <div
      className="border-2 border-mc-border rounded-sm shrink-0 grid place-items-center"
      style={{ width: size, height: size, background: c }}
    />
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className={`${PF} text-mc-sky uppercase tracking-wider text-sm`}>{title}</h2>
      {children}
    </section>
  );
}

/* ── SUMMARY VARIANTS ─────────────────────────────────────── */

function SummaryA() {
  const p1Wins = P1.total > P2.total;
  return (
    <div className={`${PANEL} px-4 py-3`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Head c="#3b82f6" size={48} />
          <div>
            <p className={`${PF} truncate ${p1Wins ? 'text-mc-gold' : 'text-mc-stone-light'}`}>{P1.name}</p>
            <p className={`${PF} text-lg text-mc-grass tabular-nums`}>{P1.total.toLocaleString()}</p>
          </div>
        </div>
        <div className="text-center shrink-0">
          <span className={`${PF} text-2xl text-mc-gold`}>VS</span>
          <p className={`text-[0.6rem] ${PF} uppercase text-mc-stone-light tracking-wider`}>{P1.name} ahead</p>
        </div>
        <div className="flex items-center gap-3 min-w-0 flex-row-reverse text-right">
          <Head c="#22c55e" size={48} />
          <div>
            <p className={`${PF} truncate text-mc-stone-light`}>{P2.name}</p>
            <p className={`${PF} text-lg text-mc-grass tabular-nums`}>{P2.total.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryB() {
  return (
    <div className={`${PANEL} grid grid-cols-2 divide-x-2 divide-mc-border`}>
      {[
        { p: P1, c: '#3b82f6', wins: true },
        { p: P2, c: '#22c55e', wins: false },
      ].map((s, i) => (
        <div key={i} className="p-3 flex items-center gap-3">
          <Head c={s.c} size={40} />
          <div>
            <p className={`${PF} ${s.wins ? 'text-mc-gold' : 'text-mc-stone-light'}`}>{s.p.name}</p>
            <p className={`${PF} text-xl text-mc-grass tabular-nums`}>{s.p.total.toLocaleString()} AP</p>
            <p className="text-[0.6rem] text-mc-stone-light">Completion 52%</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SummaryC() {
  const diff = Math.abs(P1.total - P2.total);
  const lead = P1.total > P2.total ? P1.name : P2.name;
  return (
    <div className={`${PANEL} px-4 py-3 flex items-center justify-center gap-4`}>
      <span className={`${PF} text-3xl text-mc-grass tabular-nums`}>{P1.total.toLocaleString()}</span>
      <div className="text-center">
        <p className={`${PF} text-xs uppercase text-mc-stone-light`}>diff</p>
        <p className={`${PF} text-xl text-mc-gold tabular-nums`}>+{diff.toLocaleString()}</p>
        <p className={`text-[0.6rem] ${PF} uppercase text-mc-grass`}>{lead} leads</p>
      </div>
      <span className={`${PF} text-3xl text-mc-grass tabular-nums`}>{P2.total.toLocaleString()}</span>
    </div>
  );
}

/* ── GAME BREAKDOWN VARIANTS ──────────────────────────────── */

function BreakdownA_Table() {
  return (
    <div className={`${PANEL} overflow-hidden`}>
      <table className="w-full table-fixed text-sm">
        <thead>
          <tr className="bg-mc-panel border-b-[3px] border-mc-border">
            <th className="w-8 px-2 py-1.5"></th>
            <th className="text-left px-2 py-1.5">
              <span className={`${PF} text-xs uppercase text-mc-stone-light tracking-wider`}>Game</span>
            </th>
            <th className="text-right px-2 py-1.5">
              <span className={`${PF} text-xs uppercase text-mc-sky tracking-wider`}>{P1.name}</span>
            </th>
            <th className="text-right px-2 py-1.5">
              <span className={`${PF} text-xs uppercase text-mc-sky tracking-wider`}>{P2.name}</span>
            </th>
            <th className="text-right px-2 py-1.5 w-20">
              <span className={`${PF} text-xs uppercase text-mc-stone-light tracking-wider`}>Diff</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r, i) => {
            const icon = gameIconUrl(r.game);
            const diff = r.p1Obtained - r.p2Obtained;
            return (
              <tr key={r.game} className={i % 2 ? 'bg-black/20' : ''}>
                <td className="px-2 py-1.5 text-center">
                  {icon && (
                    <PixelImg src={icon} alt="" width={16} height={16} className="inline-block" />
                  )}
                </td>
                <td className={`px-2 py-1.5 ${PF} text-xs text-mc-gold truncate`}>{formatGameLabel(r.game)}</td>
                <td className={`px-2 py-1.5 text-right tabular-nums ${diff > 0 ? 'text-mc-grass' : 'text-mc-stone-light'}`}>{r.p1Obtained.toLocaleString()}</td>
                <td className={`px-2 py-1.5 text-right tabular-nums ${diff < 0 ? 'text-mc-grass' : 'text-mc-stone-light'}`}>{r.p2Obtained.toLocaleString()}</td>
                <td className={`px-2 py-1.5 text-right tabular-nums text-xs ${diff > 0 ? 'text-mc-grass' : diff < 0 ? 'text-mc-red' : 'text-mc-stone-light'}`}>
                  {diff > 0 ? '+' : ''}{diff.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function BreakdownB_CardSplit() {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {ROWS.map((r) => {
        const icon = gameIconUrl(r.game);
        const p1Wins = r.p1Obtained > r.p2Obtained;
        return (
          <div key={r.game} className={`${PANEL} overflow-hidden`}>
            <div className="flex items-center gap-2 bg-mc-panel border-b-[3px] border-mc-border px-2.5 py-1.5">
              {icon && <PixelImg src={icon} alt="" width={20} height={20} className="shrink-0" />}
              <h3 className={`${PF} text-sm text-mc-gold uppercase tracking-[0.04em] truncate`}>{formatGameLabel(r.game)}</h3>
            </div>
            <div className="flex divide-x-2 divide-mc-border">
              <div className="flex-1 min-w-0 p-2.5">
                <p className={`${PF} text-xs uppercase ${p1Wins ? 'text-mc-grass' : 'text-mc-stone-light'}`}>{P1.name}</p>
                <p className={`${PF} text-mc-gold text-base tabular-nums`}>{r.p1Obtained.toLocaleString()} AP</p>
                <p className="text-[0.65rem] text-mc-stone-light">{r.p1Completed}/{r.p1Count} done</p>
              </div>
              <div className="flex-1 min-w-0 p-2.5 text-right">
                <p className={`${PF} text-xs uppercase ${!p1Wins ? 'text-mc-grass' : 'text-mc-stone-light'}`}>{P2.name}</p>
                <p className={`${PF} text-mc-gold text-base tabular-nums`}>{r.p2Obtained.toLocaleString()} AP</p>
                <p className="text-[0.65rem] text-mc-stone-light">{r.p2Completed}/{r.p2Count} done</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BreakdownC_IconStrip() {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {ROWS.map((r) => {
        const icon = gameIconUrl(r.game);
        const diff = r.p1Obtained - r.p2Obtained;
        return (
          <div key={r.game} className={`${PANEL} flex`}>
            <div className="bg-mc-panel border-r-[3px] border-mc-border grid place-items-center p-3 shrink-0">
              {icon && <PixelImg src={icon} alt="" width={32} height={32} />}
            </div>
            <div className="flex-1 min-w-0 p-2.5">
              <h3 className={`${PF} text-sm text-mc-gold uppercase truncate`}>{formatGameLabel(r.game)}</h3>
              <div className="flex justify-between items-baseline mt-1">
                <span className={`${PF} text-xs ${diff >= 0 ? 'text-mc-grass' : 'text-mc-stone-light'}`}>{P1.name} {r.p1Obtained.toLocaleString()}</span>
                <span className={`${PF} text-xs ${diff <= 0 ? 'text-mc-grass' : 'text-mc-stone-light'}`}>{r.p2Obtained.toLocaleString()} {P2.name}</span>
              </div>
              <p className={`text-[0.6rem] ${PF} ${diff > 0 ? 'text-mc-grass' : diff < 0 ? 'text-mc-red' : 'text-mc-stone-light'}`}>
                {diff > 0 ? `${P1.name} +${diff.toLocaleString()}` : diff < 0 ? `${P2.name} +${Math.abs(diff).toLocaleString()}` : 'tied'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BreakdownD_ClashBar() {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {ROWS.map((r) => {
        const icon = gameIconUrl(r.game);
        const sum = r.p1Obtained + r.p2Obtained || 1;
        const p1Frac = (r.p1Obtained / sum) * 100;
        const p1Wins = r.p1Obtained > r.p2Obtained;
        return (
          <div key={r.game} className={`${PANEL} p-2.5`}>
            <div className="flex items-center gap-2 mb-2">
              {icon && <PixelImg src={icon} alt="" width={18} height={18} className="shrink-0" />}
              <h3 className={`${PF} text-sm text-mc-gold uppercase truncate flex-1`}>{formatGameLabel(r.game)}</h3>
            </div>
            <div className="flex justify-between items-baseline mb-1">
              <span className={`${PF} text-xs ${p1Wins ? 'text-mc-grass' : 'text-mc-stone-light'}`}>{r.p1Obtained.toLocaleString()}</span>
              <span className={`${PF} text-xs ${!p1Wins ? 'text-mc-grass' : 'text-mc-stone-light'}`}>{r.p2Obtained.toLocaleString()}</span>
            </div>
            <div className="h-3 bg-black/40 border-2 border-mc-border flex">
              <div className="h-full bg-mc-grass" style={{ width: `${p1Frac}%` }} />
              <div className="h-full bg-mc-red/60" style={{ width: `${100 - p1Frac}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BreakdownE_Minimal() {
  return (
    <div className={`${PANEL} overflow-hidden divide-y-2 divide-mc-border`}>
      {ROWS.map((r) => {
        const icon = gameIconUrl(r.game);
        const diff = r.p1Obtained - r.p2Obtained;
        const winner = diff > 0 ? P1.name : diff < 0 ? P2.name : 'tie';
        return (
          <div key={r.game} className="flex items-center gap-3 px-3 py-2">
            {icon && <PixelImg src={icon} alt="" width={20} height={20} className="shrink-0" />}
            <span className={`${PF} text-sm text-mc-gold uppercase flex-1 truncate`}>{formatGameLabel(r.game)}</span>
            <span className={`${PF} text-xs ${diff > 0 ? 'text-mc-grass' : diff < 0 ? 'text-mc-red' : 'text-mc-stone-light'}`}>
              {winner === 'tie' ? 'TIE' : `${winner} +${Math.abs(diff).toLocaleString()}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function BreakdownF_Matchup() {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {ROWS.map((r) => {
        const icon = gameIconUrl(r.game);
        const p1Wins = r.p1Obtained > r.p2Obtained;
        const Side = ({ c, name, obt, tot, wins, right }: { c: string; name: string; obt: number; tot: number; wins: boolean; right?: boolean }) => {
          const pct = tot > 0 ? (obt / tot) * 100 : 0;
          const headC = wins ? '#5fb84a' : '#b03a3a';
          return (
            <div className={`flex items-center gap-2 min-w-0 ${right ? 'flex-row-reverse' : ''}`}>
              <div className="rounded-sm shrink-0 border-2" style={{ width: 40, height: 40, background: c, borderColor: headC }} />
              <div className={`min-w-0 flex-1 ${right ? 'text-right' : ''}`}>
                <p className={`${PF} text-xs uppercase tracking-wider truncate ${wins ? 'text-mc-grass' : 'text-mc-stone-light'}`}>{name}</p>
                <p className={`${PF} text-sm tabular-nums ${wins ? 'text-mc-gold' : 'text-mc-stone-light'}`}>{obt.toLocaleString()} AP</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`flex-1 h-1.5 bg-black/40 border border-mc-border/60 overflow-hidden ${right ? 'flex flex-row-reverse' : ''}`}>
                    <div className="h-full bg-mc-grass" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                  <span className="text-[0.6rem] text-mc-stone-light tabular-nums shrink-0">{pct.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          );
        };
        return (
          <div key={r.game} className={`${PANEL} p-3`}>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <Side c="#3b82f6" name={P1.name} obt={r.p1Obtained} tot={r.p1Total} wins={p1Wins} />
              <div className="flex flex-col items-center gap-1 px-2 border-x-2 border-mc-border/50">
                {icon && <PixelImg src={icon} alt="" width={28} height={28} className="shrink-0" />}
                <span className={`${PF} text-[0.65rem] text-mc-gold uppercase tracking-[0.03em] text-center leading-tight`}>{formatGameLabel(r.game)}</span>
              </div>
              <Side c="#22c55e" name={P2.name} obt={r.p2Obtained} tot={r.p2Total} wins={!p1Wins} right />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function CompareShowcasePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      <h1 className={`${PF} text-mc-gold text-2xl uppercase tracking-wide`}>Compare — Design Showcase</h1>
      <p className="text-sm text-mc-stone-light">All variants below use mock data. Tell me which letter you want for summary and breakdown.</p>

      <Section title="▸ Summary A — Horizontal Scoreboard">
        <SummaryA />
      </Section>
      <Section title="▸ Summary B — Two Stat Columns">
        <SummaryB />
      </Section>
      <Section title="▸ Summary C — Diff Focus">
        <SummaryC />
      </Section>

      <hr className="border-mc-border/40" />

      <Section title="▸ Breakdown A — Dense Table">
        <BreakdownA_Table />
      </Section>
      <Section title="▸ Breakdown B — Card w/ Player Split">
        <BreakdownB_CardSplit />
      </Section>
      <Section title="▸ Breakdown C — Icon Strip Card">
        <BreakdownC_IconStrip />
      </Section>
      <Section title="▸ Breakdown D — Clash Bar Card">
        <BreakdownD_ClashBar />
      </Section>
      <Section title="▸ Breakdown E — Minimal Win List">
        <BreakdownE_Minimal />
      </Section>
      <Section title="▸ Breakdown F — Matchup (icon+name center, players flanking)">
        <BreakdownF_Matchup />
      </Section>
    </main>
  );
}
