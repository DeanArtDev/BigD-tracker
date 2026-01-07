import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTaskCommand } from './create-task.command';
import { CreateTaskUseCase } from './create-task.use-case';

@CommandHandler(CreateTaskCommand)
export class CreateTaskHandler implements ICommandHandler<CreateTaskCommand> {
  constructor(private createTaskUseCase: CreateTaskUseCase) {}

  async execute({ input }: CreateTaskCommand): Promise<TaskView> {
    return await this.createTaskUseCase.execute(input);
  }
}
