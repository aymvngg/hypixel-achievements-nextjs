import { Suspense } from 'react';
import { BreakdownPage } from '@/components/breakdown/BreakdownPage';
import { Loading } from '@/components/ui/Loading';

export default async function PlayerBreakdownRoute({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return (
    <Suspense fallback={<Loading />}>
      <BreakdownPage username={decodeURIComponent(username)} />
    </Suspense>
  );
}
