import { isRetryableError } from "@/lib/util/errors";

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_BASE_DELAY_MS = 500;

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withTimeout<T>(
	promise: Promise<T>,
	ms = DEFAULT_TIMEOUT_MS,
): Promise<T> {
	let timer: ReturnType<typeof setTimeout> | undefined;
	const timeout = new Promise<never>((_, reject) => {
		timer = setTimeout(
			() => reject(new Error(`Request timed out after ${ms}ms`)),
			ms,
		);
	});

	try {
		return await Promise.race([promise, timeout]);
	} finally {
		if (timer) clearTimeout(timer);
	}
}

export async function withRetry<T>(
	fn: () => Promise<T>,
	options?: {
		maxAttempts?: number;
		baseDelayMs?: number;
		timeoutMs?: number;
	},
): Promise<T> {
	const maxAttempts = options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
	const baseDelayMs = options?.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
	const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

	let lastError: unknown;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await withTimeout(fn(), timeoutMs);
		} catch (err) {
			lastError = err;
			if (!isRetryableError(err) || attempt === maxAttempts) break;
			const backoff = baseDelayMs * 2 ** (attempt - 1);
			const jitter = Math.floor(
				Math.random() * Math.max(1, backoff * 0.2),
			);
			await sleep(backoff + jitter);
		}
	}

	throw lastError;
}
