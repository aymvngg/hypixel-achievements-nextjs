export interface RedisCacheEntry {
	value: ReadableStream<Uint8Array>;
	tags: string[];
	stale: number;
	timestamp: number;
	expire: number;
	revalidate: number;
}

export function serializeEntry(entry: RedisCacheEntry): Promise<string>;
export function deserializeEntry(raw: string): RedisCacheEntry;
