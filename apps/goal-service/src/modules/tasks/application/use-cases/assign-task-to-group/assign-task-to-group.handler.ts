import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TaskView } from '../../dto';
import { AssignTaskToGroupCommand } from './assign-task-to-group.command';
import { AssignTaskToGroupUseCase } from './assign-task-to-group.use-case';

@CommandHandler(AssignTaskToGroupCommand)
export class AssignTaskToGroupHandler implements ICommandHandler<AssignTaskToGroupCommand> {
  constructor(private assignTaskToGroupUseCase: AssignTaskToGroupUseCase) {}

  async execute(command: AssignTaskToGroupCommand): Promise<TaskView> {
    return await this.assignTaskToGroupUseCase.execute(command);
  }
}
