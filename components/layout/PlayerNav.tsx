import Link from 'next/link';

export function PlayerNav({ username }: { username: string }) {
  const encoded = encodeURIComponent(username);
  return (
    <nav className="flex gap-2 font-[family-name:var(--font-pixel)] text-sm uppercase">
      <Link
        href={`/player/${encoded}`}
        className="mc-btn px-3 py-1.5 bg-mc-grass text-white hover:bg-mc-grass-dark"
      >
        Achievements
      </Link>
      <Link
        href={`/player/${encoded}/breakdown`}
        className="mc-btn px-3 py-1.5 bg-mc-stone text-white hover:bg-mc-stone-light"
      >
        Breakdown
      </Link>
    </nav>
  );
}
