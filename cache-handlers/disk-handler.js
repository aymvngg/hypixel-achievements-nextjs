const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const CACHE_DIR = path.join(process.cwd(), 'lib', '.cache', 'next-cache');
const TAGS_INDEX_FILE = path.join(CACHE_DIR, '_tags.json');
const pendingSets = new Map();
let dirEnsured = false;

function cacheFilePath(cacheKey) {
  const hash = crypto.createHash('sha256').update(cacheKey).digest('hex');
  return path.join(CACHE_DIR, `${hash}.json`);
}

function cacheFileName(cacheKey) {
  return `${crypto.createHash('sha256').update(cacheKey).digest('hex')}.json`;
}

async function ensureDir() {
  if (dirEnsured) return;
  await fs.mkdir(CACHE_DIR, { recursive: true });
  dirEnsured = true;
}

async function readTagsIndex() {
  try {
    const raw = await fs.readFile(TAGS_INDEX_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function writeTagsIndex(index) {
  await ensureDir();
  await fs.writeFile(TAGS_INDEX_FILE, JSON.stringify(index), 'utf8');
}

async function setTagsForFile(fileName, tags) {
  if (!Array.isArray(tags) || tags.length === 0) return;

  const index = await readTagsIndex();
  for (const tagList of Object.values(index)) {
    if (!Array.isArray(tagList)) continue;
    const idx = tagList.indexOf(fileName);
    if (idx !== -1) tagList.splice(idx, 1);
  }
  for (const tag of tags) {
    if (!index[tag]) index[tag] = [];
    if (!index[tag].includes(fileName)) index[tag].push(fileName);
  }
  await writeTagsIndex(index);
}

async function rebuildTagsIndex() {
  const index = {};
  let files;
  try {
    files = await fs.readdir(CACHE_DIR);
  } catch {
    return index;
  }

  await Promise.all(
    files.map(async (file) => {
      if (!file.endsWith('.json') || file === '_tags.json') return;
      try {
        const raw = await fs.readFile(path.join(CACHE_DIR, file), 'utf8');
        const data = JSON.parse(raw);
        if (!Array.isArray(data.tags)) return;
        for (const tag of data.tags) {
          if (!index[tag]) index[tag] = [];
          if (!index[tag].includes(file)) index[tag].push(file);
        }
      } catch {
        // Ignore unreadable cache files while rebuilding the tag index.
      }
    }),
  );

  await writeTagsIndex(index);
  return index;
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
      const fileName = cacheFileName(cacheKey);

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

      await setTagsForFile(fileName, entry.tags);
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
      let index = await readTagsIndex();
      const hasIndexedTags = tags.some((tag) => Array.isArray(index[tag]) && index[tag].length > 0);
      if (!hasIndexedTags) {
        index = await rebuildTagsIndex();
      }

      const filesToDelete = new Set();
      for (const tag of tags) {
        const fileList = index[tag];
        if (!Array.isArray(fileList)) continue;
        for (const file of fileList) filesToDelete.add(file);
      }

      await Promise.all(
        [...filesToDelete].map(async (file) => {
          try {
            await fs.unlink(path.join(CACHE_DIR, file));
          } catch {
            // Ignore missing cache files during tag invalidation.
          }
        }),
      );

      for (const file of filesToDelete) {
        for (const [tag, fileList] of Object.entries(index)) {
          if (!Array.isArray(fileList)) continue;
          const next = fileList.filter((entry) => entry !== file);
          if (next.length === 0) delete index[tag];
          else index[tag] = next;
        }
      }

      await writeTagsIndex(index);
    } catch {
      // Ignore missing cache directory during tag invalidation.
    }
  },
};
