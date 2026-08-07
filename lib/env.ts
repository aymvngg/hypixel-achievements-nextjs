import "server-only";

import { z } from "zod";

const apiKeySchema = z.string().min(1, "HYPIXEL_API_KEY is required");

export interface AppEnv {
	DEMO_MODE: boolean;
	HYPIXEL_API_KEY: string;
}

function parseDemoMode(value: string | undefined): boolean {
	const v = String(value ?? "").trim().toLowerCase();
	return v === "1" || v === "true" || v === "yes";
}

function loadEnv(): AppEnv {
	const demoMode = parseDemoMode(process.env.DEMO_MODE);
	const rawKey = process.env.HYPIXEL_API_KEY;
	const HYPIXEL_API_KEY = demoMode
		? (rawKey ?? "")
		: apiKeySchema.parse(rawKey);
	return { DEMO_MODE: demoMode, HYPIXEL_API_KEY };
}

let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
	if (!cached) cached = loadEnv();
	return cached;
}

export function loadHypixelApiKey(): string {
	return getEnv().HYPIXEL_API_KEY;
}

export function isDemoMode(): boolean {
	return getEnv().DEMO_MODE;
}
