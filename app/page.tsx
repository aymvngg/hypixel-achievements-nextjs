import Image from 'next/image';
import Link from 'next/link';
import { PlayerSearch } from '@/components/home/PlayerSearch';
import { BlockPanel } from '@/components/ui/BlockPanel';
import { PixelButton } from '@/components/ui/PixelButton';
import { ALL_GAME_KEYS, formatGameLabel, gameIconUrl } from '@/lib/util/games';

const features = [
  {
    title: 'Explore',
    body: 'Filter and sort every achievement by game, type, status, and reward.',
  },
  {
    title: 'Break down',
    body: 'See obtained vs missing AP for each game on one clean table.',
  },
  {
    title: 'Compare',
    body: 'Head-to-head AP comparison between any two players.',
  },
];

export default function HomePage() {
  const gameKeys = ALL_GAME_KEYS.filter((k) => k !== 'general' && k !== 'skyclash');

  return (
    <div className="space-y-8 py-8">
      {/* Hero */}
      <div className="text-center space-y-3">
        <h1 className="font-[family-name:var(--font-pixel)] text-3xl sm:text-4xl text-mc-gold">
          Hypixel Achievements
        </h1>
        <p className="text-mc-sky max-w-lg mx-auto text-sm sm:text-base">
          Browse achievements, view per-game AP breakdowns, and compare two players — same data as
          the Discord bot.
        </p>
      </div>

      {/* Search */}
      <PlayerSearch />

      {/* Features */}
      <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {features.map((f) => (
          <BlockPanel key={f.title} className="text-center space-y-2">
            <p className="font-[family-name:var(--font-pixel)] text-mc-sky uppercase text-xs tracking-wider">
              {f.title}
            </p>
            <p className="text-sm text-mc-stone-light leading-relaxed">{f.body}</p>
          </BlockPanel>
        ))}
      </div>

      {/* Game coverage strip */}
      <div className="max-w-3xl mx-auto">
        <p className="text-center text-xs font-[family-name:var(--font-pixel)] uppercase text-mc-stone-light tracking-wider mb-3">
          Every Hypixel game, tracked
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {gameKeys.map((key) => {
            const icon = gameIconUrl(key);
            if (!icon) return null;
            return (
              <span
                key={key}
                title={formatGameLabel(key)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-sm border-2 border-mc-border bg-mc-stone-dark"
              >
                <Image
                  src={icon}
                  alt=""
                  width={16}
                  height={16}
                  className="shrink-0"
                  style={{ imageRendering: 'pixelated' }}
                  unoptimized
                />
                <span className="text-[0.65rem] font-[family-name:var(--font-pixel)] text-foreground">
                  {formatGameLabel(key)}
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Compare CTA */}
      <div className="text-center">
        <Link href="/compare">
          <PixelButton variant="stone" className="px-6">
            Compare Two Players
          </PixelButton>
        </Link>
      </div>
    </div>
  );
}
