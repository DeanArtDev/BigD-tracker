import { useSuspenseQuery } from '@apollo/client/react';
import { GroupId } from '@/entity/planner/groups';
import { BrandTask, TaskPriority } from '@/entity/planner/tasks';
import { Override } from '@/shared/lib';
import { useExtendApolloErrorResult } from '@/shared/transport/graphql';
import { GetInboxDocument, GetInboxQuery } from './schemas/inbox.queries.generated';

type TaskDto = NonNullable<GetInboxQuery['getInbox']['tasks'][number]>;
type Task = BrandTask<Override<TaskDto, { priority: TaskPriority }>>;

type GetInboxResponse = Override<
  GetInboxQuery,
  {
    readonly getInbox: Override<
      GetInboxQuery['getInbox'],
      {
        readonly id: GroupId;
        readonly tasks: Task[];
      }
    >;
  }
>;

function useInboxQuerySuspense() {
  const result = useSuspenseQuery<GetInboxResponse>(GetInboxDocument, {
    context: { endpoint: 'private' },
    errorPolicy: 'all',
  });

  return {
    ...result,
    data: result.data?.getInbox,
    ...useExtendApolloErrorResult(result.error),
  };
}

export { useInboxQuerySuspense };
