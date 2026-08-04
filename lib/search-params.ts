import type { AchievementStatus, AchievementType, SortField } from '@/lib/util/validate';

export const SORT_LABELS: Record<SortField, string> = {
  name: 'Name',
  'game-pct': 'Game %',
  'global-pct': 'Global %',
  progress: 'Progress',
  points: 'Points',
};

export interface AchievementSearchParams {
  game?: string;
  type?: AchievementType;
  status?: AchievementStatus;
  sort?: SortField;
  desc?: boolean;
  search?: string;
}

export function parseAchievementSearchParams(
  params: Record<string, string | string[] | undefined>,
): AchievementSearchParams {
  const get = (key: string) => {
    const v = params[key];
    return typeof v === 'string' ? v : undefined;
  };

  return {
    game: get('game') || undefined,
    type: get('type') as AchievementType | undefined,
    status: get('status') as AchievementStatus | undefined,
    sort: (get('sort') as SortField) || undefined,
    desc: get('desc') === '1' || get('desc') === 'true',
    search: get('search') || undefined,
  };
}

export function buildAchievementSearchParams(
  current: AchievementSearchParams,
  updates: Partial<AchievementSearchParams>,
): URLSearchParams {
  const merged = { ...current, ...updates };
  const params = new URLSearchParams();

  if (merged.game) params.set('game', merged.game);
  if (merged.type) params.set('type', merged.type);
  if (merged.status) params.set('status', merged.status);
  if (merged.sort) params.set('sort', merged.sort);
  if (merged.desc) params.set('desc', '1');
  if (merged.search) params.set('search', merged.search);

  return params;
}

export function playerAchievementsHref(
  username: string,
  current: AchievementSearchParams,
  updates: Partial<AchievementSearchParams> = {},
): string {
  const base = `/player/${encodeURIComponent(username)}`;
  const params = buildAchievementSearchParams(current, updates);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function tierBar(current: number, max: number, width = 10): string {
  if (max === 0) return '';
  const filled = Math.round((current / max) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}
