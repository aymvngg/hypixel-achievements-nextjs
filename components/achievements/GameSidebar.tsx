import Link from 'next/link';
import { PixelImg } from '@/components/ui/PixelImg';
import { formatGameLabel, gameIconUrl } from '@/lib/util/games';
import type { AchievementSearchParams } from '@/lib/search-params';
import { playerAchievementsHref } from '@/lib/search-params';
import { BlockPanel } from '@/components/ui/BlockPanel';
import type { GameStat } from '@/lib/logic/achievement-stats';

const PF = 'font-[family-name:var(--font-pixel)]';

function GameNavItem({
  active,
  label,
  stat,
  icon,
  href,
}: {
  active: boolean;
  label: string;
  stat: GameStat;
  icon?: string | null;
  href: string;
}) {
  const pct = stat.total > 0 ? (stat.obtained / stat.total) * 100 : 0;
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? 'page' : undefined}
      className={`block w-full text-left rounded-sm border-2 transition-colors duration-150 ${
        active
          ? 'bg-mc-grass/20 border-mc-grass'
          : 'border-transparent hover:bg-mc-stone-dark hover:border-mc-border/50'
      }`}
    >
      <div className="flex items-center gap-2.5 px-2 py-1.5">
        {icon ? (
          <PixelImg src={icon} alt="" width={28} height={28} className="shrink-0" />
        ) : (
          <span className="w-7 h-7 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`truncate ${PF} text-xs ${active ? 'text-mc-sky' : 'text-foreground'}`}>
              {label}
            </span>
            <span className={`shrink-0 ${PF} text-[0.65rem] tabular-nums ${active ? 'text-mc-sky' : 'text-mc-stone-light'}`}>
              {pct.toFixed(0)}%
            </span>
          </div>
          <div className="mt-1 h-1.5 bg-black/40 overflow-hidden">
            <div
              className={`h-full ${active ? 'bg-mc-gold' : 'bg-mc-grass'}`}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function GameSidebar({
  username,
  games,
  params,
  totalStat,
  gameStats,
}: {
  username: string;
  games: string[];
  params: AchievementSearchParams;
  totalStat: GameStat;
  gameStats: Record<string, GameStat>;
}) {
  const sortedGames = [...games].sort((a, b) =>
    formatGameLabel(a).localeCompare(formatGameLabel(b)),
  );
  const activeGame = params.game;

  return (
    <BlockPanel className="p-2 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto">
      <nav className="flex flex-col gap-0.5">
        <GameNavItem
          active={!activeGame}
          label="All games"
          stat={totalStat}
          icon="/icons/general.png"
          href={playerAchievementsHref(username, params, { game: undefined })}
        />
        {sortedGames.map((game) => (
          <GameNavItem
            key={game}
            active={activeGame === game}
            label={formatGameLabel(game)}
            stat={gameStats[game] ?? { count: 0, obtained: 0, total: 0, completed: 0 }}
            icon={gameIconUrl(game)}
            href={playerAchievementsHref(username, params, { game })}
          />
        ))}
      </nav>
    </BlockPanel>
  );
}
