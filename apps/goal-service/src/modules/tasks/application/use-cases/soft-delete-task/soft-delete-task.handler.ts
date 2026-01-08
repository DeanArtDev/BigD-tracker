import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SoftDeleteTaskCommand } from './soft-delete-task.command';
import { SoftDeleteTaskUseCase } from './soft-delete-task.use-case';

@CommandHandler(SoftDeleteTaskCommand)
export class SoftDeleteTaskHandler implements ICommandHandler<SoftDeleteTaskCommand> {
  constructor(private softDeleteTaskUseCase: SoftDeleteTaskUseCase) {}

  async execute({ input }: SoftDeleteTaskCommand): Promise<{ id: number }> {
    return await this.softDeleteTaskUseCase.execute(input);
  }
}
