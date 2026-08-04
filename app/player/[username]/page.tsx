import { Suspense } from 'react';
import { AchievementsPage } from '@/components/achievements/AchievementsPage';
import { Loading } from '@/components/ui/Loading';

async function PlayerAchievementsContent({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <AchievementsPage username={decodeURIComponent(username)} />;
}

export default function PlayerAchievementsPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <PlayerAchievementsContent params={params} />
    </Suspense>
  );
}
