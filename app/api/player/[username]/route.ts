import { NextResponse } from 'next/server';
import {
  correlateAchievements,
  fetchAchievements,
  fetchPlayer,
  getGameNames,
  toPublicPlayerData,
} from '@/lib/hypixel/api';
import { formatError } from '@/lib/util/errors';
import { validatePlayerQuery } from '@/lib/util/validate';

export async function GET(
  _request: Request,
  context: { params: Promise<{ username: string }> },
) {
  try {
    const { username: raw } = await context.params;
    const query = validatePlayerQuery(raw);

    const [achievements, player] = await Promise.all([
      fetchAchievements(),
      fetchPlayer(query),
    ]);

    const views = correlateAchievements(achievements, player);
    const games = getGameNames(achievements);

    return NextResponse.json(
      {
        player: toPublicPlayerData(player),
        views,
        games,
      },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' } },
    );
  } catch (err) {
    const message = formatError(err);
    const status = message.includes('not found') || message.includes('never logged') ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
