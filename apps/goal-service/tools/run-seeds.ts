import { runSeeds as baseRunSeeds } from '@big-d/database';
import * as dotenv from 'dotenv';
import { join } from 'node:path';
import * as process from 'node:process';
import seeds from '../db/seeds';

dotenv.config({ path: [join(process.cwd(), '.env.development')] });

export async function runSeeds() {
  const scriptKey = process.argv[2];
  await baseRunSeeds(seeds, scriptKey);
}

runSeeds();
