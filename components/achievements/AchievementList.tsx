import type { AchievementView } from '@/lib/hypixel/types';
import { formatGameLabel } from '@/lib/util/games';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { BlockPanel } from '@/components/ui/BlockPanel';

function formatPercent(value: number): string {
  return Number.isFinite(value) ? value.toFixed(1) : '0.0';
}

export function AchievementRow({ view }: { view: AchievementView }) {
  const statusVariant = view.completed ? 'completed' : 'missing';
  const typeVariant = view.type === 'TIERED' ? 'tiered' : 'onetime';

  return (
    <BlockPanel className="py-3 px-3 space-y-1">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className="font-[family-name:var(--font-pixel)] text-mc-gold text-sm">
            {view.name}
          </span>
          <Badge variant={typeVariant}>
            {view.type === 'TIERED' ? 'Tiered' : 'One-time'}
          </Badge>
          <Badge variant={statusVariant}>
            {view.completed ? 'Done' : 'Missing'}
          </Badge>
        </div>
        <span className="text-mc-gold font-bold text-sm shrink-0">
          {view.obtainedPoints}/{view.totalPoints} AP
        </span>
      </div>
      <p className="text-sm text-mc-stone-light">{view.description}</p>
      <div className="flex flex-wrap gap-4 text-xs text-mc-sky">
        <span>{formatGameLabel(view.game)}</span>
        <span>Game {formatPercent(view.gamePercentUnlocked)}%</span>
        <span>Global {formatPercent(view.globalPercentUnlocked)}%</span>
        {view.type === 'TIERED' && (
          <span className="flex items-center gap-2">
            Tier {view.currentTier}/{view.maxTier}
            <ProgressBar current={view.currentTier} max={view.maxTier} />
          </span>
        )}
      </div>
    </BlockPanel>
  );
}

export function AchievementList({ views }: { views: AchievementView[] }) {
  if (views.length === 0) {
    return (
      <BlockPanel className="text-center text-mc-stone-light py-8">
        No achievements match your filters.
      </BlockPanel>
    );
  }

  return (
    <div className="space-y-2">
      {views.map((view) => (
        <AchievementRow key={`${view.game}-${view.codeName}`} view={view} />
      ))}
    </div>
  );
}
