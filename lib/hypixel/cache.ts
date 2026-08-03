import 'server-only';

import path from 'node:path';
import Keyv from 'keyv';
import { KeyvFile } from 'keyv-file';

const CACHE_DIR = path.join(process.cwd(), 'lib', '.cache');

export const ACHIEVEMENTS_TTL = 24 * 60 * 60 * 1000;
export const PLAYER_TTL = 5 * 60 * 1000;
export const UUID_TTL = 6 * 60 * 60 * 1000;

const store = new KeyvFile({
  filename: path.join(CACHE_DIR, 'cache.json'),
  expiredCheckDelay: 60 * 60 * 1000,
});

const keyv = new Keyv({
  store,
  namespace: 'hypixel',
});

keyv.on('error', (err: unknown) => {
  console.warn(`Warning: cache error (${formatError(err)})`);
});

let cacheWriteWarned = false;

export async function readCache<T>(key: string): Promise<T | null> {
  try {
    const value = await keyv.get<T>(key);
    return value ?? null;
  } catch {
    return null;
  }
}

export async function writeCache<T>(key: string, data: T, ttlMs: number): Promise<void> {
  try {
    await keyv.set(key, data, ttlMs);
  } catch (err) {
    if (!cacheWriteWarned) {
      console.warn(`Warning: failed to write cache (${formatError(err)})`);
      cacheWriteWarned = true;
    }
  }
}

function formatError(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
