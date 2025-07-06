import {
  CreateRepeatableThingCommand,
  CreateRepeatableThingHandler,
  DeleteThingHandler,
  DeleteThingCommand,
  CreateThingCommand,
  CreateThingHandler,
  UpdateThingCommand,
  UpdateThingHandler,
  FinishThingCommand,
  FinishThingHandler,
  UpdateRepeatableThingCommand,
  UpdateRepeatableThingHandler,
} from '@/modules/things/application/commands';
import {
  GetRepeatableThingsQuery,
  GetThingByIdQuery,
  GetThingsByGroupIdQuery,
  GetTodaysThingsQuery,
  GetRepeatableThingsHandler,
  GetThingByIdHandler,
  GetThingsByGroupIdHandler,
  GetTodaysThingsHandler,
} from '@/modules/things/application/queries';
import { Module } from '@nestjs/common';
import { THING_REPOSITORY } from './application';
import { KyselyThingsRepository } from './infra/kysely-things.repository';

const commands = [
  CreateRepeatableThingCommand,
  DeleteThingCommand,
  CreateThingCommand,
  UpdateThingCommand,
  FinishThingCommand,
  UpdateRepeatableThingCommand,
];
const handlers = [
  CreateThingHandler,
  CreateRepeatableThingHandler,
  DeleteThingHandler,
  UpdateThingHandler,
  FinishThingHandler,
  UpdateRepeatableThingHandler,
  GetRepeatableThingsHandler,
  GetThingByIdHandler,
  GetThingsByGroupIdHandler,
  GetTodaysThingsHandler,
];
const queries = [
  GetThingByIdQuery,
  GetThingsByGroupIdQuery,
  GetTodaysThingsQuery,
  GetRepeatableThingsQuery,
];
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
