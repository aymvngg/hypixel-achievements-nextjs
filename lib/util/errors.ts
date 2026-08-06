const NON_RETRY_MARKERS = [
	"Invalid API Key",
	"No API Key",
	"No nickname or uuid",
	"Malformed UUID",
	"Player does not exist",
	"Player has never logged",
	"HYPIXEL_API_KEY not set",
	"Invalid player name",
	"Player name or UUID is required",
];

export function formatError(err: unknown): string {
	if (err instanceof Error) {
		let msg = err.message.replace(/\[hypixel-api-reborn\]\s*/g, "").trim();
		const discordIdx = msg.indexOf("For help join our Discord");
		if (discordIdx !== -1) {
			msg = msg.slice(0, discordIdx).trim();
		}
		return msg.replace(/[!.]+$/, "");
	}
	return String(err);
}

export function isRetryableError(err: unknown): boolean {
	const msg = formatError(err);
	return !NON_RETRY_MARKERS.some((marker) => msg.includes(marker));
}
