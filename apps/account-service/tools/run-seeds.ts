import { runSeeds as baseRunSeeds } from '@big-d/database';
import * as process from 'node:process';
import seeds from '../db/seeds';
import { DB } from '../src/infrastructure/types';

export async function runSeeds() {
  console.log('account', process.env.DB_HOST);
  console.log('account', process.env.DB_PORT);
  console.log('account', process.env.DB_DATABASE);
  console.log('account', process.env.DB_USERNAME);
  console.log('account', process.env.DB_PASSWORD);
  const scriptKey = process.argv[2];
  await baseRunSeeds<DB>(seeds, scriptKey);
}

runSeeds();
