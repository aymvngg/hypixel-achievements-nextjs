import { AchievementsPage } from '@/components/achievements/AchievementsPage';

export default async function PlayerAchievementsPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <AchievementsPage username={decodeURIComponent(username)} />;
}
