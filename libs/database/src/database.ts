import { PostgresDialect } from 'kysely';
import { KyselyConfig } from 'kysely';
import { Database } from './database.interface';
import { Pool, PoolConfig } from 'pg';

type PostgresDatabaseOptions = PoolConfig & {
  logging?: KyselyConfig['log'];
};

/**
 * @deprecated используй KyselyPostgresDB, databaseToken, PostgresDbModule
 * */
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
    await this.destroy();
  }
}

export { PostgresDatabaseOptions, PostgresDatabase };
