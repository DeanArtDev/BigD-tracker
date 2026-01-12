import { DB } from '@/infrastructure/types';
import { GroupView } from '@/modules/tasks/application/dto';
import { Database } from '@/modules/tasks/application/ports';
import { GroupsService } from '@/modules/tasks/application/services';
import { CreateGroupCommand } from './create-group.command';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
class CreateGroupUseCase {
  constructor(
    private readonly groupsService: GroupsService,
    @Inject(databaseToken.CONNECTION) private readonly db: Database<DB>,
  ) {}

  async execute({ input }: CreateGroupCommand): Promise<GroupView> {
    return this.db.runTransaction(async (trx) => {
      return this.groupsService.createTask(input, trx);
    });
  }
}

export { CreateGroupUseCase };
