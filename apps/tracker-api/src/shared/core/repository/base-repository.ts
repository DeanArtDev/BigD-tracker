import { Kysely, Transaction } from 'kysely';

class BaseRepository<DB> {
  constructor(private readonly _db: Kysely<DB>) {}

  db(trx?: Transaction<DB>): Kysely<DB> | Transaction<DB> {
    return trx ?? this._db;
  }
}

export { BaseRepository };
