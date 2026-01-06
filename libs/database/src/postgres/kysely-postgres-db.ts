import { OnApplicationShutdown } from '@nestjs/common';
import { Kysely, KyselyConfig, PostgresDialect, Transaction } from 'kysely';
import { Pool, PoolConfig } from 'pg';
import { IKyselyPostgresDB } from './kysely-postgres-db.interface';

type KyselyPostgresDBOptions = PoolConfig & {
  logging?: KyselyConfig['log'];
};

class KyselyPostgresDB<DB> implements OnApplicationShutdown, IKyselyPostgresDB<DB> {
  #closing: Promise<void> | null = null;
  #pool: Pool;
  #queryBuilder: Kysely<DB>;

  constructor(options: KyselyPostgresDBOptions) {
    this.#pool = new Pool(options);

    this.#queryBuilder = new Kysely({
      dialect: new PostgresDialect({ pool: this.#pool }),
      log: options.logging,
    });
  }

  public async runTransaction<T>(work: (trx: Transaction<DB>) => Promise<T>) {
    return await this.#queryBuilder.transaction().execute(work);
  }

  public qb(trx?: Transaction<DB>): Kysely<DB> {
    return trx != null ? trx : this.#queryBuilder;
  }

  async #close() {
    this.#closing ??= this.#queryBuilder.destroy();
    await this.#closing;
  }

  public async onApplicationShutdown(): Promise<void> {
    await this.#close();
  }
}

export { KyselyPostgresDBOptions, KyselyPostgresDB };
