import { THINGS_REPOSITORY, ThingsRepository } from '@/modules/things/application';
import { ThingEntity } from '@/modules/things/domain';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  GetRepeatableThingsQuery,
  GetThingByIdQuery,
  GetThingsByGroupIdQuery,
  GetTodaysThingsQuery,
} from './get-things.query';

@QueryHandler(GetThingByIdQuery)
export class GetThingByIdHandler implements IQueryHandler<GetThingByIdQuery> {
  constructor(@Inject(THINGS_REPOSITORY) private readonly thingsRepo: ThingsRepository) {}

  async execute({ input }: GetThingByIdQuery): Promise<ThingEntity | null> {
    return await this.thingsRepo.findById(input);
  }
}

@QueryHandler(GetThingsByGroupIdQuery)
export class GetThingsByGroupIdHandler implements IQueryHandler<GetThingsByGroupIdQuery> {
  constructor(@Inject(THINGS_REPOSITORY) private readonly thingsRepo: ThingsRepository) {}

  async execute({ input }: GetThingsByGroupIdQuery): Promise<ThingEntity[]> {
    return await this.thingsRepo.findByGroupId(input);
  }
}

@QueryHandler(GetTodaysThingsQuery)
export class GetTodaysThingsHandler implements IQueryHandler<GetTodaysThingsQuery> {
  constructor(@Inject(THINGS_REPOSITORY) private readonly thingsRepo: ThingsRepository) {}

  async execute({ input }: GetTodaysThingsQuery): Promise<ThingEntity[]> {
    return await this.thingsRepo.findTodays(input);
  }
}

@QueryHandler(GetRepeatableThingsQuery)
export class GetRepeatableThingsHandler implements IQueryHandler<GetRepeatableThingsQuery> {
  constructor(@Inject(THINGS_REPOSITORY) private readonly thingsRepo: ThingsRepository) {}

  async execute({ input }: GetRepeatableThingsQuery): Promise<ThingEntity[]> {
    return await this.thingsRepo.findRepeatable(input);
  }
}
