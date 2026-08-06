import "server-only";

import { loadHypixelApiKey } from "@/lib/env";
import { patchHypixelRateLimit } from "@/lib/hypixel/patch-hypixel-rate-limit";
import type { Client } from "hypixel-api-reborn";

patchHypixelRateLimit();

// Import after patch so Client construction uses the fixed rate limiter.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Client: HypixelClient } = require("hypixel-api-reborn") as {
	Client: typeof Client;
};

let clientInstance: Client | null = null;

export function getHypixelClient(): Client {
	if (!clientInstance) {
		const key = loadHypixelApiKey();
		clientInstance = new HypixelClient(key, {
			silent: true,
			checkForUpdates: false,
			rateLimit: "NONE",
			syncWithHeaders: false,
		});
	}
	return clientInstance;
}
