import { useQuery } from '@apollo/client/react';
import { GroupId } from '@/entity/planner/groups';
import { inboxInitialRequestVariables } from '@/entity/planner/inbox';
import { BrandTask, TaskPriority } from '@/entity/planner/tasks';
import { TaskStatus } from '@/entity/schema-types';
import { Override } from '@/shared/lib';
import { useExtendApolloErrorResult } from '@/shared/transport/graphql';
import { GetInboxDocument, GetInboxQuery, GetInboxQueryVariables } from './schemas/inbox.schema.generated';

type InboxTaskDto = NonNullable<NonNullable<GetInboxQuery['getInbox']['tasks']>['items'][number]>;
type InboxTask = BrandTask<Override<InboxTaskDto, { priority: TaskPriority }>>;

type GetInboxResponse = Override<
  GetInboxQuery,
  {
    readonly getInbox: Override<
      GetInboxQuery['getInbox'],
      {
        readonly id: GroupId;
        readonly tasks: Override<
          NonNullable<GetInboxQuery['getInbox']['tasks']>,
          {
            readonly items: InboxTask[];
          }
        >;
      }
    >;
  }
>;

function useInboxQuery(params?: {
  search?: string;
  filter?: {
    status?: TaskStatus[];
    priority?: number[];
  };
}) {
  const result = useQuery<GetInboxResponse, GetInboxQueryVariables>(GetInboxDocument, {
    context: { endpoint: 'private' },
    variables: {
      input: {
        ...inboxInitialRequestVariables,
        search: params?.search,
        status: params?.filter?.status,
        priority: params?.filter?.priority,
      },
    },
    errorPolicy: 'all',
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  const initialLoading = result.networkStatus === 1;

  return {
    ...result,
    initialLoading,
    isEmpty: !initialLoading && !result.loading && (result.data?.getInbox?.tasks?.items.length ?? 0) <= 0,
    data: {
      id: result.data?.getInbox.id,
      name: result.data?.getInbox.name,
      tasks: result.data?.getInbox.tasks.items,
      meta: result.data?.getInbox.tasks.meta,
    },
    ...useExtendApolloErrorResult(result.error),
  };
}

export { useInboxQuery, type InboxTask };
