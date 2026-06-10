import { TaskStatus } from '@big-d/api-contracts';

export class GetTasksQuery {
  constructor(
    readonly input: {
      readonly userId: number;
      readonly search?: string;
      readonly limit: number;
      readonly filter?: {
        readonly priority?: number[];
        readonly status?: TaskStatus[];
        readonly groupIds?: number[];
        readonly ids?: string[];
        readonly lastId?: string;
      };
    },
  ) {}
}
