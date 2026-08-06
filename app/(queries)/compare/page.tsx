import { Suspense } from 'react';
import { CompareForm } from '@/components/compare/CompareForm';
import { CompareGameCards } from '@/components/compare/CompareGameCards';
import { CompareSummary } from '@/components/compare/CompareSummary';
import { BlockPanel } from '@/components/ui/BlockPanel';
import { Loading } from '@/components/ui/Loading';
import { getComparePageData } from '@/lib/hypixel/compare-data';
import { shortName } from '@/lib/util/display';
import { formatError } from '@/lib/util/errors';

async function CompareResults({ p1, p2 }: { p1: string; p2: string }) {
  let data;
  try {
    data = await getComparePageData(p1, p2, 'obtained');
  } catch (err) {
    return (
      <BlockPanel className="text-center py-8 text-mc-red">
        {formatError(err)}
      </BlockPanel>
    );
  }

  return (
    <div className="space-y-4">
      <CompareSummary
        p1={data.p1}
        p2={data.p2}
        p1Name={data.p1Name}
        p2Name={data.p2Name}
        p1Total={data.result.p1TotalObtained}
        p2Total={data.result.p2TotalObtained}
      />
      <CompareGameCards
        rows={data.result.rows}
        p1={data.p1}
        p2={data.p2}
        p1Short={shortName(data.p1)}
        p2Short={shortName(data.p2)}
      />
    </div>
  );
}

async function ComparePageContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const p1 = typeof sp.p1 === 'string' ? sp.p1.trim() : '';
  const p2 = typeof sp.p2 === 'string' ? sp.p2.trim() : '';
  const samePlayer = p1 && p2 && p1.toLowerCase() === p2.toLowerCase();

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-pixel)] text-2xl text-mc-gold text-center">
        Compare Players
      </h1>
      <CompareForm p1={p1} p2={p2} />

      {samePlayer && (
        <BlockPanel className="text-mc-red text-center">Players must be different.</BlockPanel>
      )}

      {p1 && p2 && !samePlayer && (
        <Suspense fallback={<Loading message="Comparing players" />}>
          <CompareResults p1={p1} p2={p2} />
        </Suspense>
      )}
    </div>
  );
}

export default function ComparePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<Loading message="Loading compare" />}>
      <ComparePageContent searchParams={searchParams} />
    </Suspense>
  );
}
