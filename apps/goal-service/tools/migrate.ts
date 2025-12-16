import * as dotenv from 'dotenv';
import { join } from 'node:path';
import { migrate, migrateActionMap } from '@big-d/database';

/* TODO: FIXME: мигрировать через отдельную роль */
dotenv.config({
  path: [join(process.cwd(), '.env.development')],
});

export async function runMigrate() {
  const method = process.argv[2];
  await migrate({
    migrationFolder: join(process.cwd(), './db/migrations/'),
    method: method as keyof typeof migrateActionMap,
  });
}

runMigrate();
