import * as dotenv from 'dotenv';
import { join } from 'node:path';
import { runSeeds as baseRunSeeds } from '@big-d/database';
import * as process from 'node:process';
import seeds from '../db/seeds';
import { DB } from '../src/infrastructure/types';

/* TODO: FIXME: мигрировать через отдельную роль */
dotenv.config({
  path: [join(process.cwd(), '.env.development')],
});

export async function runSeeds() {
  const scriptKey = process.argv[2];
  await baseRunSeeds<DB>(seeds, scriptKey);
}

runSeeds();
