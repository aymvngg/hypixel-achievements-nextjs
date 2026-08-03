import Link from 'next/link';
import { PlayerSearch } from '@/components/home/PlayerSearch';
import { BlockPanel } from '@/components/ui/BlockPanel';
import { PixelButton } from '@/components/ui/PixelButton';

export default function HomePage() {
  return (
    <div className="space-y-8 py-8">
      <div className="text-center space-y-3">
        <h1 className="font-[family-name:var(--font-pixel)] text-3xl sm:text-4xl text-mc-gold">
          Hypixel Achievements
        </h1>
        <p className="text-mc-sky max-w-lg mx-auto text-sm sm:text-base">
          Browse achievements, view per-game AP breakdowns, and compare two players — same data as
          the Discord bot.
        </p>
      </div>

      <PlayerSearch />

      <div className="flex justify-center gap-3">
        <Link href="/compare">
          <PixelButton variant="stone">Compare Two Players</PixelButton>
        </Link>
      </div>

      <BlockPanel className="text-sm text-mc-stone-light space-y-2 max-w-lg mx-auto">
        <p className="font-[family-name:var(--font-pixel)] text-mc-gold uppercase text-xs">
          Features
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Filter and sort achievements by game, type, status</li>
          <li>Per-game obtained vs missing AP breakdown</li>
          <li>Head-to-head player comparison by game</li>
        </ul>
      </BlockPanel>
    </div>
  );
}
