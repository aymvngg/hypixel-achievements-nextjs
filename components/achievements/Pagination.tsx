'use client';

import { useRouter, usePathname } from 'next/navigation';
import { PAGE_SIZE } from '@/lib/search-params';
import { buildAchievementSearchParams, type AchievementSearchParams } from '@/lib/search-params';
import { PixelButton } from '@/components/ui/PixelButton';

export function Pagination({
  total,
  params,
}: {
  total: number;
  params: AchievementSearchParams;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = params.page ?? 1;

  function goTo(pageNum: number) {
    const next = buildAchievementSearchParams(params, { page: pageNum });
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      <PixelButton variant="stone" disabled={page <= 1} onClick={() => goTo(1)}>
        First
      </PixelButton>
      <PixelButton variant="stone" disabled={page <= 1} onClick={() => goTo(page - 1)}>
        Prev
      </PixelButton>
      <span className="font-[family-name:var(--font-pixel)] text-sm px-2">
        {page} / {totalPages}
      </span>
      <PixelButton variant="stone" disabled={page >= totalPages} onClick={() => goTo(page + 1)}>
        Next
      </PixelButton>
      <PixelButton variant="stone" disabled={page >= totalPages} onClick={() => goTo(totalPages)}>
        Last
      </PixelButton>
    </div>
  );
}
