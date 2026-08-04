import Link from 'next/link';

export function PlayerNav({
  username,
  activeSection,
}: {
  username: string;
  activeSection: 'achievements' | 'breakdown';
}) {
  const encoded = encodeURIComponent(username);
  const base = `/player/${encoded}`;

  return (
    <nav
      className="flex items-center gap-1 border-2 border-mc-border bg-mc-stone-dark p-1 rounded-sm w-fit"
      aria-label="Player sections"
    >
      <Link
        href={base}
        aria-current={activeSection === 'achievements' ? 'page' : undefined}
        className={`px-3 py-1.5 text-xs font-[family-name:var(--font-pixel)] uppercase rounded-sm transition-colors ${
          activeSection === 'achievements' ? 'bg-mc-grass text-white' : 'text-mc-stone-light hover:text-foreground'
        }`}
      >
        🏆 Achievements
      </Link>
      <Link
        href={`${base}/breakdown`}
        aria-current={activeSection === 'breakdown' ? 'page' : undefined}
        className={`px-3 py-1.5 text-xs font-[family-name:var(--font-pixel)] uppercase rounded-sm transition-colors ${
          activeSection === 'breakdown' ? 'bg-mc-grass text-white' : 'text-mc-stone-light hover:text-foreground'
        }`}
      >
        📊 Breakdown
      </Link>
    </nav>
  );
}
