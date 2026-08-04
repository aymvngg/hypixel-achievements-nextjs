import { searchPlayer } from '@/app/actions/search';
import { BlockPanel } from '@/components/ui/BlockPanel';
import { PixelButton } from '@/components/ui/PixelButton';
import { PlayerSearchInput } from '@/components/home/PlayerSearchInput';

export function PlayerSearch() {
  return (
    <BlockPanel className="max-w-md mx-auto">
      <form action={searchPlayer} className="flex gap-2">
        <PlayerSearchInput />
        <PixelButton type="submit" variant="grass" className="px-6">
          Go
        </PixelButton>
      </form>
    </BlockPanel>
  );
}
