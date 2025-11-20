import {
  GetGroupByIdHandler,
  GetGroupByIdQuery,
  GetGroupUserInboxHandler,
  GetGroupUserInboxQuery,
} from '@/modules/groups/application/queries';
import {
  CreateThingCommand,
  CreateThingHandler,
  DeleteThingCommand,
  DeleteThingHandler,
  UpdateThingCommand,
  UpdateThingHandler,
} from '@/modules/things/application/commands';
import {
  GetThingByIdHandler,
  GetThingByIdQuery,
  GetThingsByFiltersHandler,
  GetThingsByFiltersQuery,
  GetThingsByGroupIdHandler,
  GetThingsByGroupIdQuery,
} from '@/modules/things/application/queries';
import { ThingEntity } from '@/modules/things/domain';
import { ThingDto } from '@big-d/api-contracts';
import { ReturnHandlerType } from '@big-d/api-utils';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ThingsMapper } from './things.mapper';

@Injectable()
export class ThingsService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly mapper: ThingsMapper,
  ) {}

  async getThingByFilters(input: {
    userId: number;
    from?: string;
    to?: string;
  }): Promise<ThingDto[]> {
    const things = await this.queryBus.execute<
      GetThingsByFiltersQuery,
      ReturnHandlerType<typeof GetThingsByFiltersHandler>
    >(new GetThingsByFiltersQuery({ userId: input.userId, to: input.to, from: input.from }));

    return things.map(this.mapper.fromEntityToDTO);
  }

  async createIntoInBoxGroup(input: {
    userId: number;
    name: string;
    description?: string;
    priority?: number;
    startDate?: string;
    deadline?: string;
  }): Promise<ThingDto> {
    const inbox = await this.queryBus.execute<
      GetGroupUserInboxQuery,
      ReturnHandlerType<typeof GetGroupUserInboxHandler>
    >(new GetGroupUserInboxQuery({ userId: input.userId }));
    if (inbox == null) {
      throw new InternalServerErrorException(`There is no inbox group for user: ${input.userId}`);
    }

    const things = await this.queryBus.execute<
      GetThingsByGroupIdQuery,
      ReturnHandlerType<typeof GetThingsByGroupIdHandler>
    >(new GetThingsByGroupIdQuery({ groupId: inbox.id, userId: input.userId }));

    const { id } = await this.commandBus.execute<
      CreateThingCommand,
      ReturnHandlerType<typeof CreateThingHandler>
    >(new CreateThingCommand({ ...input, groupId: inbox.id, position: things.length + 1 }));

    const thing = await this.queryBus.execute<
      GetThingByIdQuery,
      ReturnHandlerType<typeof GetThingByIdHandler>
    >(new GetThingByIdQuery({ id, userId: input.userId }));
    if (thing == null) {
      throw new InternalServerErrorException('Error occurred while creating thing');
    }

    return this.mapper.fromEntityToDTO(thing);
  }

  async createThing(input: {
    userId: number;
    name: string;
    groupId?: number;
    description?: string;
    priority?: number;
    startDate?: string;
    deadline?: string;
  }): Promise<ThingDto> {
    if (input.groupId != null) {
      const thing = await this.#createThingToGroup({ ...input, groupId: input.groupId });
      return this.mapper.fromEntityToDTO(thing);
    }

    const { id } = await this.commandBus.execute<
      CreateThingCommand,
      ReturnHandlerType<typeof CreateThingHandler>
    >(new CreateThingCommand({ ...input, position: 0 }));

    const thing = await this.queryBus.execute<
      GetThingByIdQuery,
      ReturnHandlerType<typeof GetThingByIdHandler>
    >(new GetThingByIdQuery({ id, userId: input.userId }));
    if (thing == null) {
      throw new InternalServerErrorException('Error occurred while creating thing');
    }

    return this.mapper.fromEntityToDTO(thing);
  }

  async #createThingToGroup(input: {
    groupId: number;
    userId: number;
    name: string;
    description?: string;
    priority?: number;
    startDate?: string;
    deadline?: string;
  }): Promise<ThingEntity> {
    const group = await this.queryBus.execute<
      GetGroupByIdQuery,
      ReturnHandlerType<typeof GetGroupByIdHandler>
    >(new GetGroupByIdQuery({ id: input.groupId, userId: input.userId }));
    if (group == null) {
      throw new InternalServerErrorException(`There is no such a group: ${input.groupId}`);
    }

    const things = await this.queryBus.execute<
      GetThingsByGroupIdQuery,
      ReturnHandlerType<typeof GetThingsByGroupIdHandler>
    >(new GetThingsByGroupIdQuery({ groupId: group.id, userId: input.userId }));

    const { id } = await this.commandBus.execute<
      CreateThingCommand,
      ReturnHandlerType<typeof CreateThingHandler>
    >(new CreateThingCommand({ ...input, groupId: group.id, position: things.length + 1 }));

    const thing = await this.queryBus.execute<
      GetThingByIdQuery,
      ReturnHandlerType<typeof GetThingByIdHandler>
    >(new GetThingByIdQuery({ id, userId: input.userId }));
    if (thing == null) {
      throw new InternalServerErrorException('Error occurred while creating thing');
    }

    return thing;
  }

  async updateThing(input: {
    id: number;
    userId: number;
    name: string;
    description?: string;
    priority?: number;
    startDate?: string;
    deadline?: string;
  }): Promise<ThingDto> {
    const { id } = await this.commandBus.execute<
      UpdateThingCommand,
      ReturnHandlerType<typeof UpdateThingHandler>
    >(new UpdateThingCommand(input));

    const thing = await this.queryBus.execute<
      GetThingByIdQuery,
      ReturnHandlerType<typeof GetThingByIdHandler>
    >(new GetThingByIdQuery({ id, userId: input.userId }));
    if (thing == null) {
      throw new InternalServerErrorException('Error occurred while creating thing');
    }

    return this.mapper.fromEntityToDTO(thing);
  }

  async delete(input: { id: number; userId: number }): Promise<boolean> {
    return await this.commandBus.execute<
      DeleteThingCommand,
      ReturnHandlerType<typeof DeleteThingHandler>
    >(new DeleteThingCommand(input));
  }
}
