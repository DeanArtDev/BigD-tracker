import { DB } from '@/infrastructure/types';
import { GroupEntity } from '@/modules/groups/domain';
import {
  CreateThingCommand,
  CreateThingHandler,
  UpdateThingCommand,
  UpdateThingHandler,
} from '@/modules/things/application/commands';
import { Priority, ThingEntity } from '@/modules/things/domain';
import {
  DateVo,
  ISyncCollectionMethods,
  KyselyUnitOfWork,
  Name,
  ReturnHandlerType,
  SyncCollectionRepository,
  SyncCollectionRepositoryHelper,
} from '@big-d/api-utils';
import { Database, DATABASE_CONNECTION } from '@big-d/database';
import { Inject, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { Transaction } from 'kysely';
import { GetGroupByIdHandler, GetGroupByIdQuery } from '../../queries';
import { UpdateGroupCommand, UpdateGroupHandler } from '../update';
import { UpdateGroupWithThingsCommand } from './update-group.command';

@CommandHandler(UpdateGroupWithThingsCommand)
export class UpdateGroupWithThingsHandler
  extends KyselyUnitOfWork<DB>
  implements ICommandHandler<UpdateGroupWithThingsCommand>, ISyncCollectionMethods<GroupEntity, DB>
{
  private syncCollection: SyncCollectionRepositoryHelper<GroupEntity, DB>;

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly database: Database<DB>,
    private readonly syncCollectionRepo: SyncCollectionRepository<DB>,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {
    super(database);

    this.syncCollection = new SyncCollectionRepositoryHelper<GroupEntity, DB>({
      upsertRoot: this.upsertRoot.bind(this),
      sync: this.sync.bind(this),
    });
  }

  async execute({ input }: UpdateGroupWithThingsCommand): Promise<{ id: number }> {
    const { id, things, userId, position, name, description } = input;

    const group = await this.queryBus.execute<
      GetGroupByIdQuery,
      ReturnHandlerType<typeof GetGroupByIdHandler>
    >(new GetGroupByIdQuery({ id, userId: input.userId }));

    if (group == null) {
      throw new NotFoundException(`Group: ${input.id} is not found`);
    }
    const previousGroup = group.createClone();

    position != null && group.setPosition(position);
    group.setName(Name.create(name));
    group.setDescription(description);
    group.setThings(
      things.map((thing, index) =>
        ThingEntity.create({
          id: thing.id,
          userId,
          groupId: group.id,
          position: index,
          description: thing.description,
          name: Name.create(thing.name),
          priority: thing.priority != null ? Priority.create(thing.priority) : undefined,
          deadline: thing.deadline != null ? DateVo.create(thing.deadline) : undefined,
          startDate: thing.startDate != null ? DateVo.create(thing.startDate) : undefined,
        }),
      ),
    );
    group.validate();

    try {
      await this.runTransaction(async (transaction) => {
        await this.syncCollection.save(group, transaction);
      });
    } catch (error) {
      await this.#compensation(previousGroup);
      throw error;
    }

    const newGroup = await this.queryBus.execute<
      GetGroupByIdQuery,
      ReturnHandlerType<typeof GetGroupByIdHandler>
    >(new GetGroupByIdQuery({ id: group.id, userId: input.userId }));

    if (newGroup == null) {
      throw new InternalServerErrorException(`Failed to update group`);
    }

    return { id: newGroup.id };
  }

  async #compensation(input: GroupEntity) {
    await this.commandBus.execute<UpdateGroupCommand, ReturnHandlerType<typeof UpdateGroupHandler>>(
      new UpdateGroupCommand(input),
    );

    for (const thing of input.things) {
      if (!thing.isDraft) {
        await this.commandBus.execute<
          UpdateThingCommand,
          ReturnHandlerType<typeof UpdateThingHandler>
        >(new UpdateThingCommand(thing));
      }
    }
  }

  async upsertRoot(exercise: GroupEntity): Promise<void> {
    await this.commandBus.execute<UpdateGroupCommand, ReturnHandlerType<typeof UpdateGroupHandler>>(
      new UpdateGroupCommand({
        id: exercise.id,
        name: exercise.name,
        userId: exercise.userId,
        position: exercise.position,
        description: exercise.description,
      }),
    );
  }

  async sync(aggregate: GroupEntity, trx: Transaction<DB>): Promise<void> {
    const delta = await this.syncCollectionRepo.execute({
      trx,
      tableName: 'things',
      parent: { id: aggregate.id, field: 'group_id' },
      newRowsIds: aggregate.things.map((e) => e.id),
    });

    for (let i = 0; i < aggregate.things.length; i++) {
      const thing = aggregate.things[i];
      if (delta.toInsert.includes(thing.id)) {
        await this.commandBus.execute<
          CreateThingCommand,
          ReturnHandlerType<typeof CreateThingHandler>
        >(
          new CreateThingCommand({
            groupId: aggregate.id,
            position: i,
            userId: aggregate.userId,
            startDate: thing.startDate,
            name: thing.name,
            priority: thing.priority,
            deadline: thing.deadline,
            description: thing.description,
          }),
        );
      }

      if (delta.toKeep.includes(thing.id)) {
        await this.commandBus.execute<
          UpdateThingCommand,
          ReturnHandlerType<typeof UpdateThingHandler>
        >(
          new UpdateThingCommand({
            id: thing.id,
            position: i,
            userId: thing.userId,
            startDate: thing.startDate,
            name: thing.name,
            priority: thing.priority,
            deadline: thing.deadline,
            description: thing.description,
          }),
        );
      }
    }
  }
}
