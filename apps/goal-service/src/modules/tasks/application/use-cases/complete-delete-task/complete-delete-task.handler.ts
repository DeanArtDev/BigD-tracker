import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CompleteDeleteTaskCommand } from './complete-delete-task.command';
import { CompleteDeleteTaskUseCase } from './complete-delete-task.use-case';

@CommandHandler(CompleteDeleteTaskCommand)
export class CompleteDeleteTaskHandler implements ICommandHandler<CompleteDeleteTaskCommand> {
  constructor(private completeDeleteTaskUseCase: CompleteDeleteTaskUseCase) {}

  async execute(command: CompleteDeleteTaskCommand): Promise<{ id: number }> {
    return await this.completeDeleteTaskUseCase.execute(command);
  }
}
