import { TasksContextType, TasksRequestContext } from './request-context';
import { Injectable } from '@nestjs/common';

@Injectable()
class RequestContextService {
  public createAsClient(input: { userId: number; correlationId: string }): TasksRequestContext {
    const { userId, correlationId } = input;

    return new TasksRequestContext({
      correlationId,
      subject: { id: userId, type: TasksContextType.CLIENT },
    });
  }
}

export { RequestContextService };
