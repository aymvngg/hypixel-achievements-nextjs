import { NextResponse } from 'next/server';
import { getPlayerPageData } from '@/lib/hypixel/player-data';
import { formatError } from '@/lib/util/errors';
import { validatePlayerQuery } from '@/lib/util/validate';

export async function GET(
  _request: Request,
  context: { params: Promise<{ username: string }> },
) {
  try {
    const { username: raw } = await context.params;
    const query = validatePlayerQuery(raw);
    const data = await getPlayerPageData(query);

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
    });
  } catch (err) {
    const message = formatError(err);
    const status = message.includes('not found') || message.includes('never logged') ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
