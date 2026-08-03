'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function PlayerNav({ username }: { username: string }) {
  const pathname = usePathname();
  const encoded = encodeURIComponent(username);
  const base = `/player/${encoded}`;
  const isBreakdown = pathname.startsWith(`${base}/breakdown`);

  return (
    <nav
      className="flex items-center gap-1 border-2 border-mc-border bg-mc-stone-dark p-1 rounded-sm w-fit"
      aria-label="Player sections"
    >
      <Link
        href={base}
        aria-current={!isBreakdown ? 'page' : undefined}
        className={`px-3 py-1.5 text-xs font-[family-name:var(--font-pixel)] uppercase rounded-sm transition-colors ${
          !isBreakdown ? 'bg-mc-grass text-white' : 'text-mc-stone-light hover:text-foreground'
        }`}
      >
        🏆 Achievements
      </Link>
      <Link
        href={`${base}/breakdown`}
        aria-current={isBreakdown ? 'page' : undefined}
        className={`px-3 py-1.5 text-xs font-[family-name:var(--font-pixel)] uppercase rounded-sm transition-colors ${
          isBreakdown ? 'bg-mc-grass text-white' : 'text-mc-stone-light hover:text-foreground'
        }`}
      >
        📊 Breakdown
      </Link>
    </nav>
  );
}
