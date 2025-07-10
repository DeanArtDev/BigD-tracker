import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { getDBEnv } from '../config';

function getDb<DB>() {
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
