import { Suspense } from 'react';
import { BreakdownPage } from '@/components/breakdown/BreakdownPage';
import { Loading } from '@/components/ui/Loading';

async function PlayerBreakdownContent({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <BreakdownPage username={decodeURIComponent(username)} />;
}

export default function PlayerBreakdownRoute({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <PlayerBreakdownContent params={params} />
    </Suspense>
  );
}
