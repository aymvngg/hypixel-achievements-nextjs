import { NextResponse } from 'next/server';
import {
  correlateAchievements,
  fetchAchievements,
  fetchPlayer,
  getGameNames,
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

    const [achievementsResult, playerResult] = await Promise.all([
      fetchAchievements(),
      fetchPlayer(query),
    ]);

    const views = correlateAchievements(achievementsResult.data, playerResult.data);
    const games = getGameNames(achievementsResult.data);

    return NextResponse.json({
      player: playerResult.data,
      views,
      games,
      cache: {
        achievementsHit: achievementsResult.hit,
        playerHit: playerResult.hit,
      },
    });
  } catch (err) {
    const message = formatError(err);
    const status = message.includes('not found') || message.includes('never logged') ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
