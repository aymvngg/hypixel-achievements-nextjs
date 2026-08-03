import 'server-only';

import { z } from 'zod';

const envSchema = z.object({
  HYPIXEL_API_KEY: z.string().min(1, 'HYPIXEL_API_KEY is required'),
});

function loadEnv(): z.infer<typeof envSchema> {
  return envSchema.parse({
    HYPIXEL_API_KEY: process.env.HYPIXEL_API_KEY,
  });
}

let cached: z.infer<typeof envSchema> | null = null;

export function getEnv(): z.infer<typeof envSchema> {
  if (!cached) cached = loadEnv();
  return cached;
}

export function loadHypixelApiKey(): string {
  return getEnv().HYPIXEL_API_KEY;
}
