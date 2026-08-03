import { describe, it, expect } from 'vitest';
import { computeGameBreakdown, sortGameBreakdown } from '@/lib/logic/breakdown';
import type { AchievementView } from '@/lib/hypixel/api';

function view(overrides: Partial<AchievementView> & Pick<AchievementView, 'game'>): AchievementView {
  const totalPoints = overrides.totalPoints ?? overrides.points ?? 10;
  const obtainedPoints = overrides.obtainedPoints ?? (overrides.completed ? totalPoints : 0);
  const { game, ...rest } = overrides;
  return {
    game,
    codeName: 'test',
    name: 'Test',
    description: 'desc',
    type: 'ONE_TIME',
    completed: false,
    points: totalPoints,
    obtainedPoints,
    totalPoints,
    gamePercentUnlocked: 10,
    globalPercentUnlocked: 5,
    currentTier: 0,
    maxTier: 1,
    progress: 0,
    ...rest,
  };
}

describe('computeGameBreakdown', () => {
  it('aggregates obtained and missing points per game', () => {
    const rows = computeGameBreakdown([
      view({ game: 'skyblock', obtainedPoints: 100, totalPoints: 200, completed: false }),
      view({ game: 'skyblock', obtainedPoints: 50, totalPoints: 50, completed: true }),
      view({ game: 'bedwars', obtainedPoints: 25, totalPoints: 100, completed: false }),
    ]);

    const skyblock = rows.find((row) => row.game === 'skyblock');
    const bedwars = rows.find((row) => row.game === 'bedwars');

    expect(skyblock?.obtained).toBe(150);
    expect(skyblock?.missing).toBe(100);
    expect(skyblock?.total).toBe(250);
    expect(skyblock?.count).toBe(2);
    expect(skyblock?.completed).toBe(1);
    expect(bedwars?.obtained).toBe(25);
    expect(bedwars?.missing).toBe(75);
  });
});

describe('sortGameBreakdown', () => {
  const rows = computeGameBreakdown([
    view({ game: 'skyblock', obtainedPoints: 100, totalPoints: 200 }),
    view({ game: 'bedwars', obtainedPoints: 300, totalPoints: 400 }),
    view({ game: 'duels', obtainedPoints: 50, totalPoints: 500 }),
  ]);

  it('sorts by obtained points descending', () => {
    const sorted = sortGameBreakdown(rows, 'obtained');
    expect(sorted.map((row) => row.game)).toEqual(['bedwars', 'skyblock', 'duels']);
  });

  it('sorts by missing points descending', () => {
    const sorted = sortGameBreakdown(rows, 'missing');
    expect(sorted.map((row) => row.game)).toEqual(['duels', 'bedwars', 'skyblock']);
  });
});
