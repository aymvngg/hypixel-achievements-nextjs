export function ProgressBar({
  current,
  max,
  width = 10,
  className = '',
}: {
  current: number;
  max: number;
  width?: number;
  className?: string;
}) {
  if (max <= 0) return null;
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
