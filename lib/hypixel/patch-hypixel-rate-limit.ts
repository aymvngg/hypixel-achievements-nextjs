/**
 * hypixel-api-reborn initializes its rate limiter from getGameCounts(), but
 * GameCounts does not include resetsAfter / requestsInPastMin. That yields
 * setTimeout(NaN) and Node's TimeoutNaNWarning on every client construction.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const RateLimit = require("hypixel-api-reborn/src/Private/rateLimit");

const PATCHED = "__hypixelAchievementsPatched";

export function patchHypixelRateLimit(): void {
	if (RateLimit.prototype[PATCHED]) return;

	const originalInit = RateLimit.prototype.init;

	RateLimit.prototype.init = function (
		keyInfo: Promise<unknown>,
		options: unknown,
		client: unknown,
	) {
		const normalized = keyInfo.then((info: unknown) => {
			const data =
				info && typeof info === "object"
					? (info as Record<string, unknown>)
					: {};
			const requestsInPastMin = Number(data.requestsInPastMin);
			const resetsAfter = Number(data.resetsAfter);

			return {
				requestsInPastMin: Number.isFinite(requestsInPastMin)
					? requestsInPastMin
					: 0,
				resetsAfter:
					Number.isFinite(resetsAfter) && resetsAfter > 0
						? resetsAfter
						: 300,
			};
		});

		return originalInit.call(this, normalized, options, client);
	};

	const originalSync = RateLimit.prototype.sync;

	RateLimit.prototype.sync = function (data: Headers) {
		const resetHeader = data.get("ratelimit-reset");
		const resetSeconds = parseInt(resetHeader ?? "", 10);
		if (!resetHeader || !Number.isFinite(resetSeconds)) {
			return;
		}
		return originalSync.call(this, data);
	};

	RateLimit.prototype[PATCHED] = true;
}
