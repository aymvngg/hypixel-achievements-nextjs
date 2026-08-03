import { describe, expect, it } from 'vitest';
import { queryKeys } from '@/lib/queries/keys';

describe('query keys', () => {
  it('normalizes player identifiers for client cache reuse', () => {
    expect(queryKeys.player(' Steve ')).toEqual(queryKeys.player('steve'));
  });

  it('normalizes both compare identifiers', () => {
    expect(queryKeys.compare('Steve', 'Alex', 'obtained')).toEqual(
      queryKeys.compare(' steve ', ' alex ', 'obtained'),
    );
  });
});
