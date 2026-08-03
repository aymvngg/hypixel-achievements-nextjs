import Link from 'next/link';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/compare', label: 'Compare' },
  { href: '/player', label: 'Player' },
];

export function CornerNav() {
  return (
    <nav className="fixed top-2 right-2 z-50 flex gap-2">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="font-[family-name:var(--font-pixel)] text-[0.6rem] uppercase tracking-wider text-mc-stone-light hover:text-mc-gold transition-colors"
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
