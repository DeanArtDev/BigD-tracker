import { TasksContextType, TasksRequestContext } from '@/modules/tasks/request-context';
import { Injectable } from '@nestjs/common';

@Injectable()
class RequestContextService {
  constructor() {}

  public create(ctx: { userId: number; correlationId: string }): TasksRequestContext {
    const { userId, correlationId } = ctx;
    return new TasksRequestContext({
      correlationId,
      subject: { id: userId, type: TasksContextType.CLIENT },
    });
  }
}

export { RequestContextService };
