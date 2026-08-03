'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCompare } from '@/lib/queries/use-compare';
import { shortName } from '@/lib/util/display';
import { CompareForm } from '@/components/compare/CompareForm';
import { CompareSummary } from '@/components/compare/CompareSummary';
import { CompareGameCards } from '@/components/compare/CompareGameCards';
import { BlockPanel } from '@/components/ui/BlockPanel';
import { Loading } from '@/components/ui/Loading';

function CompareContent() {
  const searchParams = useSearchParams();
  const p1 = searchParams.get('p1')?.trim() ?? '';
  const p2 = searchParams.get('p2')?.trim() ?? '';

  const { data, isLoading, error, isFetching } = useCompare(p1, p2, 'obtained');

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-pixel)] text-2xl text-mc-gold text-center">
        Compare Players
      </h1>
      <CompareForm p1={p1} p2={p2} />

      {p1 && p2 && p1.toLowerCase() === p2.toLowerCase() && (
        <BlockPanel className="text-mc-red text-center">Players must be different.</BlockPanel>
      )}

      {isLoading && p1 && p2 && (
        <Loading message="Comparing players" />
      )}

      {error && (
        <BlockPanel className="text-center py-8 text-mc-red">
          {error instanceof Error ? error.message : 'Compare failed'}
        </BlockPanel>
      )}

      {data && (
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
          {isFetching && (
            <p className="text-xs text-mc-stone-light text-center">Refreshing...</p>
          )}
        </div>
      )}
    </div>
  );
}

export function ComparePageClient() {
  return (
    <Suspense fallback={<Loading />}>
      <CompareContent />
    </Suspense>
  );
}
