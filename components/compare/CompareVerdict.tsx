import { BlockPanel } from '@/components/ui/BlockPanel';

export function CompareVerdict({ verdict }: { verdict: string }) {
  return (
    <BlockPanel className="text-center">
      <p className="font-[family-name:var(--font-pixel)] text-mc-gold text-lg">{verdict}</p>
    </BlockPanel>
  );
}
