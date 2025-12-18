import { createUpdatedAtFieldTriggerFn, dropUpdatedAtFieldTriggerFn } from './helpers';
import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await createUpdatedAtFieldTriggerFn(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await dropUpdatedAtFieldTriggerFn(db);
}
