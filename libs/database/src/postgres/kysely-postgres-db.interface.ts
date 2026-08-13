import type { Kysely, Transaction } from 'kysely';

interface IKyselyPostgresDB<DB> {
  readonly qb: (trx?: Transaction<DB>) => Kysely<DB>;
  readonly runTransaction: <T>(work: (trx: Transaction<DB>) => Promise<T>) => Promise<T>;
}

export { IKyselyPostgresDB };
