import { NextResponse } from 'next/server';
import { getComparePageData } from '@/lib/hypixel/compare-data';
import { formatError } from '@/lib/util/errors';
import type { CompareMetric } from '@/lib/logic/compare';

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

    const data = await getComparePageData(p1Raw, p2Raw, metric);

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
    });
  } catch (err) {
    const message = formatError(err);
    const status =
      message.includes('not found') ||
      message.includes('never logged') ||
      message.includes('different')
        ? message.includes('different')
          ? 400
          : 404
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
