import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TaskRecoveryCommand } from './task-recovery.command';
import { TaskRecoveryUseCase } from './task-recovery.use-case';

@CommandHandler(TaskRecoveryCommand)
export class TaskRecoveryHandler implements ICommandHandler<TaskRecoveryCommand> {
  constructor(private readonly taskRecoveryUseCase: TaskRecoveryUseCase) {}

  async execute(command: TaskRecoveryCommand): Promise<{ id: string }> {
    return await this.taskRecoveryUseCase.execute(command);
  }
}
