import { join } from 'node:path';
import * as dotenv from 'dotenv';
import { Migrator, FileMigrationProvider, Kysely, PostgresDialect } from 'kysely';
import { promises as fs } from 'fs';
import { Pool } from 'pg';
import { getDBEnv } from '../src/shared/modules/db/config';

dotenv.config({
  path: [join(process.cwd(), '.env.production'), join(process.cwd(), '.env.development')],
});

const dbConfig = getDBEnv();
const pool = new Pool({
  host: dbConfig['DB_HOST'],
  port: dbConfig['DB_PORT'],
  user: dbConfig['DB_USERNAME'],
  password: dbConfig['DB_PASSWORD'],
  database: dbConfig['DB_DATABASE'],
});

const db = new Kysely<any>({
  dialect: new PostgresDialect({ pool }),
});

async function migrate() {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path: { join },
      migrationFolder: join(__dirname, '../db/migrations'),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`✅ Миграция ${it.migrationName} выполнена`);
    } else if (it.status === 'Error') {
      console.error(`❌ Ошибка в миграции ${it.migrationName}`);
    }
  });

  if (error) {
    console.error('❌ Миграции завершились с ошибками');
    console.error(error);
    process.exit(1);
  } else {
    console.log('🎉 Все миграции успешно применены!');
  }

  await db.destroy();
}

migrate();
