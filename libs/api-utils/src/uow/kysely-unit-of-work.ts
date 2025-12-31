import { Database } from '@big-d/database';
import { Transaction } from 'kysely';

/**
 * @deprecated используй KyselyPostgresDB, databaseToken, PostgresDbModule
 * */
export class KyselyUnitOfWork<DB> {
  protected constructor(private readonly db: Database<DB>) {}

  async runTransaction<T>(
    work: (trx: Transaction<DB>) => Promise<T>,
    trx?: Transaction<DB>,
  ): Promise<T> {
    if (trx != null) {
      return await work(trx);
    } else {
      return this.db.transaction().execute(work);
    }
  }
}
