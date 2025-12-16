import { getDb } from '@big-d/database';
import { promises as fs } from 'fs';
import { FileMigrationProvider, Migration, Migrator } from 'kysely';
import { join } from 'node:path';

const migrationsPath = [
  join(__dirname, '../apps/account-service/db/migrations'),
  join(__dirname, '../apps/training-service/db/migrations'),
  join(__dirname, '../apps/goal-service/db/migrations'),
];

async function collectMigrations(): Promise<Record<string, Migration>> {
  const all: Record<string, Migration> = {};
  for (const folder of migrationsPath) {
    const provider = new FileMigrationProvider({ fs, path: { join }, migrationFolder: folder });
    const migrations = await provider.getMigrations();
    for (const [name, mig] of Object.entries(migrations)) {
      if (all[name]) {
        throw new Error(`Такое имя уже есть: ${name}`);
      }
      all[name] = mig;
    }
  }

  return all;
}

async function migrateAll() {
  const db = getDb();

  const mergedProvider = {
    getMigrations: collectMigrations,
  };

  const migrator = new Migrator({
    db,
    provider: mergedProvider,
    allowUnorderedMigrations: false,
  });

  const { error, results = [] } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.info(`✅ Миграция ${it.migrationName} выполнена`);
    } else if (it.status === 'Error') {
      console.error(`❌ Ошибка в миграции ${it.migrationName}`);
    }
  });

  if (error) {
    console.error('❌ Миграции завершились с ошибками');
    console.error(error);
    process.exit(1);
  } else {
    console.info('🎉 Все миграции успешно применены!');
  }

  await db.destroy();
}
migrateAll();
