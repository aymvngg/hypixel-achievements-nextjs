import { NextResponse } from 'next/server';
import {
  correlateAchievements,
  fetchAchievements,
  fetchPlayer,
  toPublicPlayerData,
} from '@/lib/hypixel/api';
import {
  computeCompare,
  computeCompareVerdict,
  sortCompareRows,
  type CompareMetric,
} from '@/lib/logic/compare';
import { getDisplayName, shortName } from '@/lib/util/display';
import { formatError } from '@/lib/util/errors';
import { validatePlayerQuery } from '@/lib/util/validate';

function parseMetric(value: string | null): CompareMetric {
  return value === 'missing' ? 'missing' : 'obtained';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const p1Raw = searchParams.get('p1');
    const p2Raw = searchParams.get('p2');
    const metric = parseMetric(searchParams.get('metric'));

    if (!p1Raw || !p2Raw) {
      return NextResponse.json({ error: 'Both p1 and p2 are required' }, { status: 400 });
    }

    const p1Query = validatePlayerQuery(p1Raw);
    const p2Query = validatePlayerQuery(p2Raw);

    if (p1Query.toLowerCase() === p2Query.toLowerCase()) {
      return NextResponse.json({ error: 'Players must be different' }, { status: 400 });
    }

    const [achievementsResult, p1Result, p2Result] = await Promise.all([
      fetchAchievements(),
      fetchPlayer(p1Query),
      fetchPlayer(p2Query),
    ]);

    const p1Views = correlateAchievements(achievementsResult.data, p1Result.data);
    const p2Views = correlateAchievements(achievementsResult.data, p2Result.data);
    const result = computeCompare(p1Views, p2Views);
    const sortedRows = sortCompareRows(result.rows, metric);

    const p1Name = getDisplayName(p1Result.data, p1Query);
    const p2Name = getDisplayName(p2Result.data, p2Query);
    const verdict = computeCompareVerdict(
      result,
      shortName(p1Name),
      shortName(p2Name),
    );

    return NextResponse.json(
      {
        p1: toPublicPlayerData(p1Result.data),
        p2: toPublicPlayerData(p2Result.data),
        p1Name,
        p2Name,
        result: { ...result, rows: sortedRows },
        metric,
        verdict,
        cache: {
          achievementsHit: achievementsResult.hit,
          p1Hit: p1Result.hit,
          p2Hit: p2Result.hit,
        },
      },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' } },
    );
  } catch (err) {
    const message = formatError(err);
    const status = message.includes('not found') || message.includes('never logged') ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
