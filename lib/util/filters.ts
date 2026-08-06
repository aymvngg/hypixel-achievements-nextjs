import type { AchievementView } from '@/lib/hypixel/types';
import type { AchievementStatus, AchievementType, SortField } from '@/lib/util/validate';

export function normalizeAchievementType(type: AchievementType): 'ONE_TIME' | 'TIERED' {
  return type.toUpperCase().replaceAll('-', '_') as 'ONE_TIME' | 'TIERED';
}

export function applySearch(views: AchievementView[], search: string | undefined): AchievementView[] {
  if (!search) return views;
  const q = search.toLowerCase();
  return views.filter(
    (v) => v.name.toLowerCase().includes(q) || v.description.toLowerCase().includes(q),
  );
}

export function applyFilters(
  views: AchievementView[],
  game: string | undefined,
  type: AchievementType | undefined,
  status: AchievementStatus | undefined,
): AchievementView[] {
  return views.filter((v) => {
    if (game && v.game !== game) return false;
    if (type && v.type !== normalizeAchievementType(type)) return false;
    if (status === 'completed' && !v.completed) return false;
    if (status === 'uncompleted' && v.completed) return false;
    return true;
  });
}

export function applySorting(
  views: AchievementView[],
  field: SortField,
  desc: boolean,
): AchievementView[] {
  const sorted = [...views];
  const dir = desc ? -1 : 1;

  sorted.sort((a, b) => {
    switch (field) {
      case 'name':
        return dir * a.name.localeCompare(b.name);
      case 'game-pct':
        return dir * (a.gamePercentUnlocked - b.gamePercentUnlocked);
      case 'global-pct':
        return dir * (a.globalPercentUnlocked - b.globalPercentUnlocked);
      case 'progress':
        return (
          dir *
          ((a.type === 'TIERED' ? a.tierProgress : a.progress) -
            (b.type === 'TIERED' ? b.tierProgress : b.progress))
        );
      case 'points':
        return dir * (a.points - b.points);
      default:
        return 0;
    }
  });

  return sorted;
}

export function recomputeViews(
  sourceViews: AchievementView[],
  options: {
    search?: string;
    game?: string;
    type?: AchievementType;
    status?: AchievementStatus;
    sortField?: SortField;
    sortDesc?: boolean;
  },
): AchievementView[] {
  let result = applySearch(sourceViews, options.search);
  result = applyFilters(result, options.game, options.type, options.status);
  if (options.sortField) {
    result = applySorting(result, options.sortField, options.sortDesc ?? false);
  }
  return result;
}

export type DisplayMode = 'grouped' | 'flat' | 'single-game';

export function getDisplayMode(
  filterGame: string | undefined,
  gameArg: string | undefined,
): DisplayMode {
  if (filterGame) return 'single-game';
  if (gameArg === 'all') return 'flat';
  return 'grouped';
}
