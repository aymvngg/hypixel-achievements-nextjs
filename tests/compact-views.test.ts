import { describe, it, expect } from 'vitest';
import { fromCompactView, fromCompactViews, toCompactView, toCompactViews } from '@/lib/client/compact-views';
import type { AchievementView } from '@/lib/hypixel/types';

const sample: AchievementView = {
  game: 'bedwars',
  codeName: 'wins',
  name: 'Victory',
  description: 'Win a Bed Wars game',
  type: 'TIERED',
  completed: true,
  points: 10,
  obtainedPoints: 10,
  totalPoints: 20,
  gamePercentUnlocked: 42,
  globalPercentUnlocked: 12.5,
  currentTier: 2,
  maxTier: 5,
  progress: 0.5,
  tierTarget: 100,
  tierProgress: 0.75,
};

describe('compact views', () => {
  it('round-trips a full achievement view', () => {
    const compact = toCompactView(sample);
    const restored = fromCompactView(compact);

    expect(restored).toEqual({ ...sample, tierTarget: 0 });
  });

  it('round-trips arrays', () => {
    const compact = toCompactViews([sample, { ...sample, type: 'ONE_TIME', completed: false }]);
    const restored = fromCompactViews(compact);

    expect(restored).toHaveLength(2);
    expect(restored[0].type).toBe('TIERED');
    expect(restored[1].type).toBe('ONE_TIME');
    expect(restored[1].completed).toBe(false);
  });
});
