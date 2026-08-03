export function ProgressBar({
  current,
  max,
  width = 10,
  className = '',
  variant = 'text',
}: {
  current: number;
  max: number;
  width?: number;
  className?: string;
  variant?: 'text' | 'bar';
}) {
  if (max <= 0) return null;

  if (variant === 'bar') {
    const pct = Math.min(100, Math.max(0, (current / max) * 100));
    return (
      <div
        className={`rounded-sm h-2 overflow-hidden border-[3px] border-mc-border bg-mc-stone-dark shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_0_rgba(255,255,255,0.05)] ${className}`}
        aria-label={`${current} of ${max}`}
      >
        <div
          className="h-full bg-mc-grass"
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  }

  const filled = Math.round((current / max) * width);
  const empty = width - filled;

  return (
    <span
      className={`font-mono text-xs tracking-tighter ${className}`}
      aria-label={`${current} of ${max}`}
    >
      <span className="text-mc-grass">{'█'.repeat(filled)}</span>
      <span className="text-mc-stone-light">{'░'.repeat(empty)}</span>
    </span>
  );
}
