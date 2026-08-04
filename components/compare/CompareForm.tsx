import { PixelButton } from '@/components/ui/PixelButton';

export function CompareForm({ p1, p2 }: { p1: string; p2: string }) {
  return (
    <form
      action="/compare"
      method="GET"
      className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end"
    >
      <input type="hidden" name="metric" value="obtained" />
      <label className="flex flex-col gap-1 text-xs font-[family-name:var(--font-pixel)] uppercase flex-1">
        Player 1
        <input
          name="p1"
          type="text"
          required
          defaultValue={p1}
          placeholder="Username"
          className="rounded-sm px-3 py-2 text-sm bg-mc-stone-dark text-foreground border-[3px] border-mc-border shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_0_rgba(255,255,255,0.05)]"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-[family-name:var(--font-pixel)] uppercase flex-1">
        Player 2
        <input
          name="p2"
          type="text"
          required
          defaultValue={p2}
          placeholder="Username"
          className="rounded-sm px-3 py-2 text-sm bg-mc-stone-dark text-foreground border-[3px] border-mc-border shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_0_rgba(255,255,255,0.05)]"
        />
      </label>
      <PixelButton type="submit" variant="grass" className="px-6 shrink-0">
        Compare
      </PixelButton>
    </form>
  );
}
