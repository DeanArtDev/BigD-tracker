import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TaskView } from '../../dto';
import { SoftDeleteTaskCommand } from './soft-delete-task.command';
import { SoftDeleteTaskUseCase } from './soft-delete-task.use-case';

@CommandHandler(SoftDeleteTaskCommand)
export class SoftDeleteTaskHandler implements ICommandHandler<SoftDeleteTaskCommand> {
  constructor(private softDeleteTaskUseCase: SoftDeleteTaskUseCase) {}

  async execute(command: SoftDeleteTaskCommand): Promise<TaskView> {
    return await this.softDeleteTaskUseCase.execute(command);
  }
}
