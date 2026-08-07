import { describe, it, expect } from "vitest";
import {
	serializeEntry,
	deserializeEntry,
} from "@/cache-handlers/redis-handler";

function makeEntry(overrides: Partial<Parameters<typeof serializeEntry>[0]> = {}) {
	const value = new ReadableStream({
		start(controller) {
			controller.enqueue(new Uint8Array(Buffer.from("hello world")));
			controller.close();
		},
	});
	return {
		value,
		tags: ["hypixel"],
		stale: 300,
		timestamp: 1_700_000_000_000,
		expire: 86_400,
		revalidate: 86_400,
		...overrides,
	};
}

describe("redis cache handler serialization", () => {
	it("round-trips a cache entry through serialize/deserialize", async () => {
		const raw = await serializeEntry(makeEntry());
		const entry = deserializeEntry(raw);
		expect(entry.tags).toEqual(["hypixel"]);
		expect(entry.stale).toBe(300);
		expect(entry.expire).toBe(86_400);
		expect(entry.revalidate).toBe(86_400);
		expect(entry.timestamp).toBe(1_700_000_000_000);

		const reader = entry.value.getReader();
		const chunks: number[] = [];
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			chunks.push(...Array.from(value as Uint8Array));
		}
		expect(Buffer.from(chunks).toString()).toBe("hello world");
	});

	it("rejects malformed stored values", () => {
		expect(() => deserializeEntry('{"value":""}')).toThrow(
			/Cache entry value is missing or invalid/,
		);
		expect(() => deserializeEntry("not json")).toThrow();
	});
});
