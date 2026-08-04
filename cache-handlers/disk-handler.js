const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const CACHE_DIR = path.join(process.cwd(), 'lib', '.cache', 'next-cache');
const pendingSets = new Map();

function cacheFilePath(cacheKey) {
  const hash = crypto.createHash('sha256').update(cacheKey).digest('hex');
  return path.join(CACHE_DIR, `${hash}.json`);
}

async function ensureDir() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
}

async function readStream(stream) {
  const reader = stream.getReader();
  const chunks = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks);
}

function bufferToStream(buffer) {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(buffer));
      controller.close();
    },
  });
}

function isExpired(entry) {
  const now = Date.now();
  if (now > entry.timestamp + entry.revalidate * 1000) {
    return true;
  }
  if (entry.expire > 0 && now > entry.timestamp + entry.expire * 1000) {
    return true;
  }
  return false;
}

/** @type {import('next/dist/server/lib/cache-handlers/types').CacheHandler} */
module.exports = {
  async get(cacheKey) {
    const pendingPromise = pendingSets.get(cacheKey);
    if (pendingPromise) {
      await pendingPromise;
    }

    try {
      const raw = await fs.readFile(cacheFilePath(cacheKey), 'utf8');
      const data = JSON.parse(raw);
      if (isExpired(data)) {
        return undefined;
      }

      return {
        value: bufferToStream(Buffer.from(data.value, 'base64')),
        tags: data.tags,
        stale: data.stale,
        timestamp: data.timestamp,
        expire: data.expire,
        revalidate: data.revalidate,
      };
    } catch {
      return undefined;
    }
  },

  async set(cacheKey, pendingEntry) {
    let resolvePending = () => {};
    const pendingPromise = new Promise((resolve) => {
      resolvePending = resolve;
    });
    pendingSets.set(cacheKey, pendingPromise);

    try {
      await ensureDir();
      const entry = await pendingEntry;
      const buffer = await readStream(entry.value);

      await fs.writeFile(
        cacheFilePath(cacheKey),
        JSON.stringify({
          value: buffer.toString('base64'),
          tags: entry.tags,
          stale: entry.stale,
          timestamp: entry.timestamp,
          expire: entry.expire,
          revalidate: entry.revalidate,
        }),
        'utf8',
      );
    } catch (err) {
      console.warn(
        `Warning: failed to write Next.js cache entry (${err instanceof Error ? err.message : String(err)})`,
      );
    } finally {
      resolvePending();
      pendingSets.delete(cacheKey);
    }
  },

  async refreshTags() {},

  async getExpiration() {
    return 0;
  },

  async updateTags(tags) {
    try {
      await ensureDir();
      const files = await fs.readdir(CACHE_DIR);
      await Promise.all(
        files.map(async (file) => {
          if (!file.endsWith('.json')) return;
          const filePath = path.join(CACHE_DIR, file);
          try {
            const raw = await fs.readFile(filePath, 'utf8');
            const data = JSON.parse(raw);
            if (Array.isArray(data.tags) && data.tags.some((tag) => tags.includes(tag))) {
              await fs.unlink(filePath);
            }
          } catch {
            // Ignore unreadable cache files during tag invalidation.
          }
        }),
      );
    } catch {
      // Ignore missing cache directory during tag invalidation.
    }
  },
};
