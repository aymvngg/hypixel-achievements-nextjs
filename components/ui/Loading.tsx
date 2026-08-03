import { BlockPanel } from '@/components/ui/BlockPanel';

const PF = 'font-[family-name:var(--font-pixel)]';

export function Loading({ message = 'Loading' }: { message?: string }) {
  return (
    <BlockPanel variant="elevated" className="flex flex-col items-center gap-4 py-12">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block h-4 w-4 bg-mc-grass border-2 border-mc-border shadow-[inset_1px_1px_0_rgba(255,255,255,0.3),inset_-1px_-1px_0_rgba(0,0,0,0.3)] animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      <p className={`${PF} text-mc-sky uppercase tracking-wider text-sm`}>
        {message}
        <span className="animate-pulse">...</span>
      </p>
    </BlockPanel>
  );
}
