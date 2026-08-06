import "server-only";

import { Client } from "hypixel-api-reborn";
import { loadHypixelApiKey } from "@/lib/env";

let clientInstance: Client | null = null;

export function getHypixelClient(): Client {
	if (!clientInstance) {
		const key = loadHypixelApiKey();
		clientInstance = new Client(key, {
			silent: true,
			checkForUpdates: false,
		});
	}
	return clientInstance;
}
