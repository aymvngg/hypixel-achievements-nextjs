'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCompare } from '@/lib/queries/use-compare';
import type { CompareMetric } from '@/lib/logic/compare';
import { shortName } from '@/lib/util/display';
import { CompareForm } from '@/components/compare/CompareForm';
import { CompareTable } from '@/components/compare/CompareTable';
import { CompareVerdict } from '@/components/compare/CompareVerdict';
import { BlockPanel } from '@/components/ui/BlockPanel';
import Image from 'next/image';
import { playerHeadUrl } from '@/lib/util/playerHead';

function CompareContent() {
  const searchParams = useSearchParams();
  const p1 = searchParams.get('p1')?.trim() ?? '';
  const p2 = searchParams.get('p2')?.trim() ?? '';
  const metric = (searchParams.get('metric') === 'missing' ? 'missing' : 'obtained') as CompareMetric;

  const { data, isLoading, error, isFetching } = useCompare(p1, p2, metric);

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-pixel)] text-2xl text-mc-gold text-center">
        Compare Players
      </h1>
      <CompareForm p1={p1} p2={p2} metric={metric} />

      {p1 && p2 && p1.toLowerCase() === p2.toLowerCase() && (
        <BlockPanel className="text-mc-red text-center">Players must be different.</BlockPanel>
      )}

      {isLoading && p1 && p2 && (
        <BlockPanel className="text-center py-8 text-mc-sky">Comparing players...</BlockPanel>
      )}

      {error && (
        <BlockPanel className="text-center py-8 text-mc-red">
          {error instanceof Error ? error.message : 'Compare failed'}
        </BlockPanel>
      )}

      {data && (
        <div className="space-y-4">
          <BlockPanel className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-3">
              <Image
                src={playerHeadUrl(data.p1.uuid, 48)}
                alt={data.p1Name}
                width={48}
                height={48}
                className="border-2 border-mc-border"
                unoptimized
              />
              <div>
                <p className="font-[family-name:var(--font-pixel)] text-mc-gold">{data.p1Name}</p>
                <p className="text-sm text-mc-sky">
                  {data.result.p1TotalObtained.toLocaleString()} /{' '}
                  {data.result.p1TotalPossible.toLocaleString()} AP
                </p>
              </div>
            </div>
            <span className="font-[family-name:var(--font-pixel)] text-xl text-mc-stone-light">VS</span>
            <div className="flex items-center gap-3">
              <Image
                src={playerHeadUrl(data.p2.uuid, 48)}
                alt={data.p2Name}
                width={48}
                height={48}
                className="border-2 border-mc-border"
                unoptimized
              />
              <div>
                <p className="font-[family-name:var(--font-pixel)] text-mc-gold">{data.p2Name}</p>
                <p className="text-sm text-mc-sky">
                  {data.result.p2TotalObtained.toLocaleString()} /{' '}
                  {data.result.p2TotalPossible.toLocaleString()} AP
                </p>
              </div>
            </div>
          </BlockPanel>
          <CompareVerdict verdict={data.verdict} />
          <CompareTable
            rows={data.result.rows}
            metric={metric}
            p1Short={shortName(data.p1Name)}
            p2Short={shortName(data.p2Name)}
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
    <Suspense fallback={<BlockPanel className="text-center py-12">Loading...</BlockPanel>}>
      <CompareContent />
    </Suspense>
  );
}
