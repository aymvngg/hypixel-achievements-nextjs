import { Suspense } from 'react';
import { BreakdownPage } from '@/components/breakdown/BreakdownPage';
import { BlockPanel } from '@/components/ui/BlockPanel';

export default async function PlayerBreakdownRoute({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return (
    <Suspense fallback={<BlockPanel className="text-center py-12">Loading...</BlockPanel>}>
      <BreakdownPage username={decodeURIComponent(username)} />
    </Suspense>
  );
}
