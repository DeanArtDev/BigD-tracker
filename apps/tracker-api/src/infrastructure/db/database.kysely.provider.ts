import { Provider } from '@nestjs/common';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { DB_ENV } from '@/infrastructure/db/config';
import { APP_ENV } from '@/infrastructure/configs';
import { DB } from './types';

const KYSELY_DATABASE_PROVIDER = Symbol('KYSELY_DATABASE_PROVIDER');

interface KyselyDatabaseProvider {
  readonly db: Kysely<DB>;
  readonly pool: Pool;
}

const KyselyDatabaseProvider: Provider = {
  provide: KYSELY_DATABASE_PROVIDER,
  inject: [ConfigService],
  useFactory: (configService: ConfigService<DB_ENV & APP_ENV>): KyselyDatabaseProvider => {
    const pool = new Pool({
      host: configService.get('DB_HOST'),
      port: configService.get('DB_PORT'),
      user: configService.get('DB_USERNAME'),
      password: configService.get('DB_PASSWORD'),
      database: configService.get('DB_DATABASE'),
    });

    const db = new Kysely<DB>({
      dialect: new PostgresDialect({ pool }),
    });

    return { db, pool };
  },
};

export { KyselyDatabaseProvider, KYSELY_DATABASE_PROVIDER };
