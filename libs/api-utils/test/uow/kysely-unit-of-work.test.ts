import { describe, it, expect, vi } from 'vitest';
import { KyselyUnitOfWork } from '../../src/uow/kysely-unit-of-work';

class Uow extends KyselyUnitOfWork<any> {
  constructor(db: any) {
    // @ts-ignore
    super(db);
  }
}

describe('KyselyUnitOfWork', () => {
  it('uses provided transaction if set', async () => {
    const trx = {} as any;
    const db = { transaction: vi.fn() } as any;
    const uow = new Uow(db).useTransaction(trx);
    const work = vi.fn(async () => 1);
    const result = await uow.runTransaction(work);
    expect(result).toBe(1);
    expect(work).toHaveBeenCalledWith(trx);
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it('creates transaction when none provided', async () => {
    const trx = {} as any;
    const execute = vi.fn(async (fn) => await fn(trx));
    const db = { transaction: vi.fn(() => ({ execute })) } as any;
    const uow = new Uow(db);
    const work = vi.fn(async () => 2);
    const result = await uow.runTransaction(work);
    expect(result).toBe(2);
    expect(db.transaction).toHaveBeenCalled();
    expect(execute).toHaveBeenCalled();
    expect(work).toHaveBeenCalledWith(trx);
  });
});
