import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FinishTaskCommand } from './finish-task.command';
import { FinishTaskUseCase } from './finish-task.use-case';

@CommandHandler(FinishTaskCommand)
export class FinishTaskHandler implements ICommandHandler<FinishTaskCommand> {
  constructor(private finishTaskUseCase: FinishTaskUseCase) {}

  async execute(command: FinishTaskCommand): Promise<void> {
    return await this.finishTaskUseCase.execute(command);
  }
}
