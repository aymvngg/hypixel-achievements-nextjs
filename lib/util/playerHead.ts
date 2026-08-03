export function formatUuid(uuid: string): string {
  const clean = uuid.replace(/-/g, '');
  if (clean.length !== 32) return uuid;
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
}

export function playerHeadUrl(uuid: string, size = 64): string {
  return `https://mc-heads.net/avatar/${formatUuid(uuid)}/${size}`;
}
