import { Kysely, sql, Transaction } from 'kysely';

class BaseRepository<DB> {
  protected constructor(private readonly _db: Kysely<DB>) {}

  db(trx?: Transaction<DB>): Kysely<DB> | Transaction<DB> {
    return trx ?? this._db;
  }

  async getCurrentTxId(trx: Transaction<DB>) {
    return await trx
      .selectFrom(sql<{ txid: string }>`(SELECT txid_current() AS txid)`.as('t'))
      .selectAll()
      .executeTakeFirst();
  }
}

export { BaseRepository };
