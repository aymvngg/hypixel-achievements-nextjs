export function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'completed' | 'tiered' | 'onetime' | 'missing';
}) {
  const styles = {
    default: 'bg-mc-stone text-white',
    completed: 'bg-mc-grass text-white',
    tiered: 'bg-mc-sky text-mc-stone-dark',
    onetime: 'bg-mc-dirt text-mc-gold',
    missing: 'bg-mc-red text-white',
  };

  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-[family-name:var(--font-pixel)] uppercase border-2 border-mc-border ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
