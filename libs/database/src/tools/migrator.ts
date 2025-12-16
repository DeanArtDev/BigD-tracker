import { join } from 'node:path';
import { FileMigrationProvider, Migrator } from 'kysely';
import { promises as fs } from 'fs';
import { getDb } from './get-db';

const migrateActionMap = {
  up: 'migrateUp',
  down: 'migrateDown',
  lts: 'migrateToLatest',
};

async function migrate(options: {
  migrationFolder: string;
  method: keyof typeof migrateActionMap;
}): Promise<void> {
  const { migrationFolder, method } = options;
  const db = getDb();

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path: { join },
      migrationFolder,
    }),
  });

  const key = migrateActionMap[method];
  if (key == null) throw new Error('Wrong key, you can use [up, down, lts]');

  const { error, results } = await migrator[key]();

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

export { migrate, migrateActionMap };
