import { PostgresDialect } from 'kysely';
import { KyselyConfig } from 'kysely/dist/esm/kysely';
import { Database } from './database.interface';
import { Pool, PoolConfig } from 'pg';

type PostgresDatabaseOptions = PoolConfig & { schema?: string } & {
  logging?: KyselyConfig['log'];
};

class PostgresDatabase<DB> extends Database<DB> {
  protected pool: Pool;

  constructor(options: PostgresDatabaseOptions) {
    const pool = new Pool(options);

    super({
      dialect: new PostgresDialect({ pool }),
      log: options.logging,
    });

    this.pool = pool;
  }

  public async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}

export { PostgresDatabaseOptions, PostgresDatabase };
