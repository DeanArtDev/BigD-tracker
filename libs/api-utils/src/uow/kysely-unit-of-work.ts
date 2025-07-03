import { Database } from '@big-d/database';
import { Transaction } from 'kysely';

export class KyselyUnitOfWork<DB> {
  private transaction: Transaction<DB> | null = null;

  protected constructor(private readonly db: Database<DB>) {}

  public useTransaction(trx?: Transaction<DB>): this {
    if (this.transaction == null && trx != null) {
      this.transaction = trx;
    }
    return this;
  }

  async execute<T>(work: (trx: Transaction<DB>) => Promise<T>): Promise<T> {
    if (this.transaction != null) {
      return await work(this.transaction);
    } else {
      return this.db.transaction().execute(async (trx) => await work(trx));
    }
  }
}
