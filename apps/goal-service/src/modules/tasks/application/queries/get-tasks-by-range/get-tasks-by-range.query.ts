import { SortDirection, TaskStatus } from '@big-d/api-contracts';

export class GetTasksByRangeQuery {
  constructor(
    readonly input: {
      readonly userId: number;

      readonly meta: {
        readonly search?: string;
        readonly filter?: {
          readonly status?: TaskStatus[];
          readonly group?: number[];
          readonly priority?: number;
          readonly to?: string;
          readonly from?: string;
        };

        readonly page: number;
        readonly perPage: number;

        readonly sort?: {
          readonly priority?: SortDirection;
          readonly deadline?: SortDirection;
          readonly startDate?: SortDirection;
        };
      };
    },
  ) {}
}
