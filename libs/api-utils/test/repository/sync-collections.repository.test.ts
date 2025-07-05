import { Generated } from '@big-d/database';
import { describe, it, expect, vi } from 'vitest';
import { SyncCollectionRepository } from '../../src/repository/sync-collections.repository';

function createTrx(rows: Array<{ id: number }>) {
  return {
    selectFrom: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          execute: vi.fn().mockResolvedValue(rows),
        }),
      }),
    }),
    deleteFrom: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  } as any;
}

describe('SyncCollectionRepository', () => {
  it('deletes outdated ids and returns delta', async () => {
    const trx = createTrx([{ id: 1 }, { id: 2 }]);
    const repo = new SyncCollectionRepository<{ table: { id: Generated<number> } }>();
    const delta = await repo.execute({
      trx,
      tableName: 'table',
      parent: { field: 'parent', id: 1 },
      newRowsIds: [2, 3],
    });

    expect(delta).toEqual({ toInsert: [3], toDelete: [1], toKeep: [2] });
    expect(trx.deleteFrom).toHaveBeenCalledTimes(1);
  });

  it('skips delete if nothing to remove', async () => {
    const trx = createTrx([{ id: 1 }]);
    const repo = new SyncCollectionRepository<{ table: { id: Generated<number> } }>();
    const delta = await repo.execute({
      trx: trx,
      tableName: 'table',
      parent: { field: 'parent', id: 1 },
      newRowsIds: [1],
    });

    expect(delta).toEqual({ toInsert: [], toDelete: [], toKeep: [1] });
    expect(trx.deleteFrom).not.toHaveBeenCalled();
  });
});
