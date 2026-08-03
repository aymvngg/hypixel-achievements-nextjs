import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="border-b-4 border-mc-border bg-mc-stone-dark">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-[family-name:var(--font-pixel)] text-xl text-mc-gold tracking-wide hover:text-mc-sky transition-colors"
        >
          Hypixel Achievements
        </Link>
        <nav className="flex items-center gap-3 font-[family-name:var(--font-pixel)] text-sm uppercase">
          <Link href="/" className="text-mc-sky hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/compare" className="text-mc-sky hover:text-white transition-colors">
            Compare
          </Link>
        </nav>
      </div>
    </header>
  );
}
