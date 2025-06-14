import * as dotenv from 'dotenv';
import { join } from 'node:path';
import { Pool } from 'pg';
import { getDBEnv, DB } from '../src/infrastructure/db';
import { Kysely, PostgresDialect } from 'kysely';

dotenv.config({
  path: [join(process.cwd(), '.env.production'), join(process.cwd(), '.env.development')],
});

function getDb() {
  const dbConfig = getDBEnv();
  const pool = new Pool({
    host: dbConfig['DB_HOST'],
    port: dbConfig['DB_PORT'],
    user: dbConfig['DB_USERNAME'],
    password: dbConfig['DB_PASSWORD'],
    database: dbConfig['DB_DATABASE'],
  });

  return new Kysely<DB>({
    dialect: new PostgresDialect({ pool }),
  });
}

export { getDb };
