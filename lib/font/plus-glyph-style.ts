import { MINECRAFT_PLUS_RAISE_EM } from '@/lib/font/minecraft-metrics';

export function plusGlyphStyle(color: string): { color: string; verticalAlign: string } {
  return {
    color,
    verticalAlign: `${MINECRAFT_PLUS_RAISE_EM}em`,
  };
}
