import { Module } from '@nestjs/common';
import { THING_REPOSITORY } from './application';
import { KyselyThingsRepository } from './infra/kysely-things.repository';

const commands = [];
const handlers = [];
const queries = [];
const events = [];

@Module({
  providers: [
    { provide: THING_REPOSITORY, useClass: KyselyThingsRepository },
    ...commands,
    ...handlers,
    ...queries,
    ...events,
  ],
})
export class ThingsModule {}
