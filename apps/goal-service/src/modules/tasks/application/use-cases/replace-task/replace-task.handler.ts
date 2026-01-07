import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReplaceTaskCommand } from './replace-task.command';
import { ReplaceTaskUseCase } from './replace-task.use-case';

@CommandHandler(ReplaceTaskCommand)
export class ReplaceTaskHandler implements ICommandHandler<ReplaceTaskCommand> {
  constructor(private replaceTaskUseCase: ReplaceTaskUseCase) {}

  async execute({ input }: ReplaceTaskCommand): Promise<TaskView> {
    return await this.replaceTaskUseCase.execute(input);
  }
}
