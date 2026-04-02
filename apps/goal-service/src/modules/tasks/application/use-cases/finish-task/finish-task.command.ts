import { TaskFinishStatus } from '@big-d/api-contracts';

export class FinishTaskCommand {
  constructor(
    readonly input: {
      readonly userId: number;
      readonly taskId: string;
      readonly type: TaskFinishStatus;
      readonly reason?: string;
    },
  ) {}
}
