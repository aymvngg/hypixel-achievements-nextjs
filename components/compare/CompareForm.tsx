'use client';

import { useRouter } from 'next/navigation';
import type { CompareMetric } from '@/lib/logic/compare';
import { PixelButton } from '@/components/ui/PixelButton';
import { BlockPanel } from '@/components/ui/BlockPanel';

export function CompareForm({
  p1,
  p2,
  metric,
}: {
  p1: string;
  p2: string;
  metric: CompareMetric;
}) {
  const router = useRouter();

  return (
    <BlockPanel>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const nextP1 = (fd.get('p1') as string)?.trim();
          const nextP2 = (fd.get('p2') as string)?.trim();
          const nextMetric = (fd.get('metric') as CompareMetric) || 'obtained';
          if (!nextP1 || !nextP2) return;
          const params = new URLSearchParams({ p1: nextP1, p2: nextP2, metric: nextMetric });
          router.push(`/compare?${params}`);
        }}
        className="flex flex-col gap-4"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-xs font-[family-name:var(--font-pixel)] uppercase">
            Player 1
            <input
              name="p1"
              type="text"
              required
              defaultValue={p1}
              placeholder="Username"
              className="mc-block-inset px-3 py-2 text-sm bg-mc-stone-dark text-foreground"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-[family-name:var(--font-pixel)] uppercase">
            Player 2
            <input
              name="p2"
              type="text"
              required
              defaultValue={p2}
              placeholder="Username"
              className="mc-block-inset px-3 py-2 text-sm bg-mc-stone-dark text-foreground"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-xs font-[family-name:var(--font-pixel)] uppercase">
          Sort by
          <select
            name="metric"
            defaultValue={metric}
            className="mc-block-inset px-2 py-1.5 text-sm bg-mc-stone-dark text-foreground max-w-xs"
          >
            <option value="obtained">Obtained AP diff</option>
            <option value="missing">Missing AP diff</option>
          </select>
        </label>
        <PixelButton type="submit" variant="grass">Compare</PixelButton>
      </form>
    </BlockPanel>
  );
}
