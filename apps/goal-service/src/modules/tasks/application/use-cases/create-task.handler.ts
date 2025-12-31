import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTaskCommand } from './create-task.command';
import { CreateTaskUseCase } from './create-task.use-case';

@CommandHandler(CreateTaskCommand)
export class CreateThingHandler implements ICommandHandler<CreateTaskCommand> {
  constructor(private createTaskUseCase: CreateTaskUseCase) {}

  async execute({ input }: CreateTaskCommand): Promise<void> {
    await this.createTaskUseCase.execute(input);
  }
}
