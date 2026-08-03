import type { AchievementView } from '@/lib/hypixel/types';

export type CompareMetric = 'obtained' | 'missing';

export interface CompareRow {
  game: string;
  p1Obtained: number;
  p1Missing: number;
  p1Total: number;
  p1Completed: number;
  p1Count: number;
  p2Obtained: number;
  p2Missing: number;
  p2Total: number;
  p2Completed: number;
  p2Count: number;
}

export interface CompareResult {
  rows: CompareRow[];
  p1TotalObtained: number;
  p1TotalMissing: number;
  p1TotalPossible: number;
  p2TotalObtained: number;
  p2TotalMissing: number;
  p2TotalPossible: number;
}

function computePlayerGameBreakdown(
  views: AchievementView[],
): Map<string, { obtained: number; missing: number; total: number; completed: number; count: number }> {
  const byGame = new Map<
    string,
    { obtained: number; missing: number; total: number; completed: number; count: number }
  >();

  for (const view of views) {
    let row = byGame.get(view.game);
    if (!row) {
      row = { obtained: 0, missing: 0, total: 0, completed: 0, count: 0 };
      byGame.set(view.game, row);
    }
    row.obtained += view.obtainedPoints;
    row.total += view.totalPoints;
    row.missing += view.totalPoints - view.obtainedPoints;
    row.count += 1;
    if (view.completed) row.completed += 1;
  }

  return byGame;
}

export function computeCompare(
  p1Views: AchievementView[],
  p2Views: AchievementView[],
): CompareResult {
  const p1Breakdown = computePlayerGameBreakdown(p1Views);
  const p2Breakdown = computePlayerGameBreakdown(p2Views);

  const allGames = new Set([...p1Breakdown.keys(), ...p2Breakdown.keys()]);

  const rows: CompareRow[] = [];
  let p1TotalObtained = 0;
  let p1TotalMissing = 0;
  let p1TotalPossible = 0;
  let p2TotalObtained = 0;
  let p2TotalMissing = 0;
  let p2TotalPossible = 0;

  for (const game of allGames) {
    const p1 = p1Breakdown.get(game) ?? {
      obtained: 0,
      missing: 0,
      total: 0,
      completed: 0,
      count: 0,
    };
    const p2 = p2Breakdown.get(game) ?? {
      obtained: 0,
      missing: 0,
      total: 0,
      completed: 0,
      count: 0,
    };

    rows.push({
      game,
      p1Obtained: p1.obtained,
      p1Missing: p1.missing,
      p1Total: p1.total,
      p1Completed: p1.completed,
      p1Count: p1.count,
      p2Obtained: p2.obtained,
      p2Missing: p2.missing,
      p2Total: p2.total,
      p2Completed: p2.completed,
      p2Count: p2.count,
    });

    p1TotalObtained += p1.obtained;
    p1TotalMissing += p1.missing;
    p1TotalPossible += p1.total;
    p2TotalObtained += p2.obtained;
    p2TotalMissing += p2.missing;
    p2TotalPossible += p2.total;
  }

  return {
    rows,
    p1TotalObtained,
    p1TotalMissing,
    p1TotalPossible,
    p2TotalObtained,
    p2TotalMissing,
    p2TotalPossible,
  };
}

export function sortCompareRows(rows: CompareRow[], metric: CompareMetric): CompareRow[] {
  return [...rows].sort((a, b) => {
    const aDiff =
      metric === 'obtained' ? a.p1Obtained - a.p2Obtained : a.p1Missing - a.p2Missing;
    const bDiff =
      metric === 'obtained' ? b.p1Obtained - b.p2Obtained : b.p1Missing - b.p2Missing;
    if (bDiff !== aDiff) return bDiff - aDiff;
    return a.game.localeCompare(b.game);
  });
}

export function computeCompareVerdict(
  result: CompareResult,
  p1Short: string,
  p2Short: string,
): string {
  const p1ObtainedLead = result.p1TotalObtained - result.p2TotalObtained;
  const p1MissingLess = result.p2TotalMissing - result.p1TotalMissing;

  if (p1ObtainedLead > 0 && p1MissingLess > 0) {
    return `${p1Short} is clearly ahead (more obtained, fewer missing)`;
  }
  if (p1ObtainedLead < 0 && p1MissingLess < 0) {
    return `${p2Short} is clearly ahead (more obtained, fewer missing)`;
  }
  if (p1ObtainedLead > 0 && p1MissingLess < 0) {
    return `${p1Short} leads in obtained (+${p1ObtainedLead.toLocaleString()}), ${p2Short} has fewer missing (+${Math.abs(p1MissingLess).toLocaleString()})`;
  }
  if (p1ObtainedLead < 0 && p1MissingLess > 0) {
    return `${p2Short} leads in obtained (+${Math.abs(p1ObtainedLead).toLocaleString()}), ${p1Short} has fewer missing (+${p1MissingLess.toLocaleString()})`;
  }
  if (p1ObtainedLead > 0) {
    return `${p1Short} leads in obtained (+${p1ObtainedLead.toLocaleString()})`;
  }
  if (p1ObtainedLead < 0) {
    return `${p2Short} leads in obtained (+${Math.abs(p1ObtainedLead).toLocaleString()})`;
  }
  return 'Both players are tied';
}
