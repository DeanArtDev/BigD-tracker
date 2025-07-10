import {
  CreateThingCommand,
  CreateThingHandler,
  DeleteThingByGroupIdCommand,
  DeleteThingByGroupIdHandler,
} from '@/modules/things/application/commands';
import { ReturnHandlerType } from '@big-d/api-utils';
import { InternalServerErrorException } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetGroupByIdHandler, GetGroupByIdQuery } from '../../queries';
import { CreateGroupHandler, CreateGroupCommand } from '../create';
import { CreateGroupWithThingsCommand } from './create-group.command';

@CommandHandler(CreateGroupWithThingsCommand)
export class CreateGroupWithThingsHandler implements ICommandHandler<CreateGroupWithThingsCommand> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async execute({ input }: CreateGroupWithThingsCommand): Promise<{ id: number }> {
    const { things, userId, position, name, goalId, description } = input;

    const { id } = await this.commandBus.execute<
      CreateGroupCommand,
      ReturnHandlerType<typeof CreateGroupHandler>
    >(
      new CreateGroupCommand({
        goalId,
        position: position ?? 0,
        name,
        userId,
        description,
      }),
    );

    try {
      for (let i = 0; i < things.length; i++) {
        const thing = things[i];

        await this.commandBus.execute<
          CreateThingCommand,
          ReturnHandlerType<typeof CreateThingHandler>
        >(
          new CreateThingCommand({
            groupId: id,
            position: i,
            userId,
            startDate: thing.startDate,
            name: thing.name,
            priority: thing.priority,
            deadline: thing.deadline,
            description: thing.description,
          }),
        );
      }
    } catch (error) {
      await this.commandBus.execute<
        DeleteThingByGroupIdCommand,
        ReturnHandlerType<typeof DeleteThingByGroupIdHandler>
      >(new DeleteThingByGroupIdCommand({ groupId: id, userId: input.userId }));
      throw error;
    }

    const group = await this.queryBus.execute<
      GetGroupByIdQuery,
      ReturnHandlerType<typeof GetGroupByIdHandler>
    >(new GetGroupByIdQuery({ id, userId: input.userId }));

    if (group == null) {
      throw new InternalServerErrorException(`Failed to create group`);
    }

    return { id: group.id };
  }
}
