import { describe, it, expect, vi } from 'vitest';
import { BaseRepository } from '../../src/repository/base-repository';

class Repo extends BaseRepository<any> {
  constructor(db: any) {
    super(db);
  }
}

describe('BaseRepository', () => {
  it('returns passed transaction from db method', () => {
    const db = {} as any;
    const repo = new Repo(db);
    const trx = { tx: true } as any;
    expect(repo.db(trx)).toBe(trx);
    expect(repo.db()).toBe(db);
  });

  it('getCurrentTxId delegates to transaction query', async () => {
    const executeTakeFirst = vi.fn().mockResolvedValue({ txid: '42' });
    const trx = {
      selectFrom: vi.fn().mockReturnThis(),
      selectAll: vi.fn().mockReturnThis(),
      executeTakeFirst,
    } as any;

    const repo = new Repo({} as any);
    const result = await repo.getCurrentTxId(trx);

    expect(result).toEqual({ txid: '42' });
    expect(trx.selectFrom).toHaveBeenCalledTimes(1);
    expect(trx.selectAll).toHaveBeenCalledTimes(1);
    expect(executeTakeFirst).toHaveBeenCalledTimes(1);
  });
});
