import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CloneTaskCommand } from './clone-task.command';
import { CloneTaskUseCase } from './clone-task.use-case';

@CommandHandler(CloneTaskCommand)
export class CloneTaskHandler implements ICommandHandler<CloneTaskCommand> {
  constructor(private cloneTaskUseCase: CloneTaskUseCase) {}

  async execute({ input }: CloneTaskCommand): Promise<TaskView> {
    return await this.cloneTaskUseCase.execute(input);
  }
}
