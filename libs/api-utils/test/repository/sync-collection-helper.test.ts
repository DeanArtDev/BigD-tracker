import { describe, it, expect, vi } from 'vitest';
import { SyncCollectionRepositoryHelper } from '../../src/repository/sync-collections.repository';

describe('SyncCollectionRepositoryHelper', () => {
  it('calls upsertRoot and sync on save', async () => {
    const upsertRoot = vi.fn().mockResolvedValue(undefined);
    const sync = vi.fn().mockResolvedValue(undefined);
    const helper = new SyncCollectionRepositoryHelper({ upsertRoot, sync });
    const aggregate = { a: 1 };
    const trx = {} as any;

    await helper.save(aggregate, trx);

    expect(upsertRoot).toHaveBeenCalledWith(aggregate, trx);
    expect(sync).toHaveBeenCalledWith(aggregate, trx);
  });
});
