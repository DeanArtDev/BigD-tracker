import { SortDirection, TaskStatus } from '@big-d/api-contracts';

export class GetTasksPerPageQuery {
  constructor(
    readonly input: {
      readonly userId: number;
      readonly search?: string;
      readonly page: number;
      readonly perPage: number;
      readonly order?: 'group';
      readonly sort?: {
        readonly priority?: SortDirection;
        readonly deadline?: SortDirection;
        readonly startDate?: SortDirection;
      };
      readonly filter?: {
        readonly priority?: number[];
        readonly status?: TaskStatus[];
        readonly groupIds?: number[];
        readonly ids?: string[];
        readonly recurring?: boolean;
      };
    },
  ) {}
}
