import { ExecutionContext } from '@big-d/exceptions';
import { merge } from 'lodash';

enum TasksContextType {
  SYSTEM = 'SYSTEM',
  CLIENT = 'CLIENT',
  CRON = 'CRON',
}

interface TasksRequestContextState {
  readonly correlationId: string;
  readonly subject:
    | {
        readonly id: number;
        readonly type: TasksContextType.CLIENT;
      }
    | {
        readonly id?: never;
        readonly type: TasksContextType;
      };
}

class TasksRequestContext extends ExecutionContext<TasksRequestContextState> {
  constructor(state: TasksRequestContextState) {
    super(state);
  }

  public fork(state: TasksRequestContextState): TasksRequestContext {
    return new TasksRequestContext(merge(this.state, state));
  }
}

export { TasksRequestContext, TasksContextType, ExecutionContext };
