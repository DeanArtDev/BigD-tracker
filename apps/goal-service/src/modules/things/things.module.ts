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
  DeleteThingByGroupIdCommand,
  DeleteThingByGroupIdHandler,
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
import { ThingsService } from '@/modules/things/application';
import { FinishThingUseCase } from '@/modules/things/application/use-cases';
import { Module } from '@nestjs/common';
import { THINGS_REPOSITORY, ThingsController, ThingsMapper } from './application';
import { KyselyThingsRepository } from './infra/kysely-things.repository';

const commands = [
  CreateRepeatableThingCommand,
  DeleteThingCommand,
  DeleteThingByGroupIdCommand,
  CreateThingCommand,
  UpdateThingCommand,
  FinishThingCommand,
  UpdateRepeatableThingCommand,
];
const handlers = [
  CreateThingHandler,
  CreateRepeatableThingHandler,
  DeleteThingHandler,
  DeleteThingByGroupIdHandler,
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
const useCases = [FinishThingUseCase];

@Module({
  controllers: [ThingsController],
  providers: [
    ThingsMapper,
    ThingsService,
    { provide: THINGS_REPOSITORY, useClass: KyselyThingsRepository },
    ...commands,
    ...handlers,
    ...queries,
    ...events,
    ...useCases,
  ],
})
export class ThingsModule {}
