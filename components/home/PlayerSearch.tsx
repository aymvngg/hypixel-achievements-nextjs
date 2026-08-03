'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BlockPanel } from '@/components/ui/BlockPanel';
import { PixelButton } from '@/components/ui/PixelButton';

export function PlayerSearch() {
  const router = useRouter();
  const [value, setValue] = useState('');

  return (
    <BlockPanel className="max-w-md mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = value.trim();
          if (!trimmed) return;
          router.push(`/player/${encodeURIComponent(trimmed)}`);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter Minecraft username..."
          className="mc-block-inset flex-1 px-3 py-3 text-base bg-mc-stone-dark text-foreground"
          autoFocus
        />
        <PixelButton type="submit" variant="grass" className="px-6">
          Go
        </PixelButton>
      </form>
    </BlockPanel>
  );
}
