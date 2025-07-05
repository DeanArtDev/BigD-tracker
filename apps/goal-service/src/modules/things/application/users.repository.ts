import { DB } from '@big-d/database';
import { Selectable } from 'kysely/dist/esm';

interface ThingRawData {
  readonly selectable: Omit<Selectable<DB['users']>, 'updated_at' | 'created_at'>;
}

const THING_REPOSITORY = Symbol('THING_REPOSITORY');

interface ThingsRepository {}

export { ThingRawData, ThingsRepository, THING_REPOSITORY };
