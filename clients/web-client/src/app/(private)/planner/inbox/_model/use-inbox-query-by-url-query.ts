import { GroupId } from '@/entity/planner/groups';
import { TaskId } from '@/entity/planner/tasks';
import { inboxInitialRequestVariables, useInboxQuery } from '@/shared/transport/graphql';
import { useInboxUrlQuery } from './use-inbox-url-query';

function useInboxQueryByUrlQuery() {
  const [searchQuery] = useInboxUrlQuery();

  const filter = {
    search: searchQuery?.search,
    status: searchQuery?.status,
    priority: searchQuery?.priority,
  };

  const result = useInboxQuery<GroupId, TaskId>({
    search: searchQuery?.search,
    filter,
  });

  return {
    ...result,
    fetchMore: () =>
      result.fetchMore({
        variables: {
          input: {
            limit: inboxInitialRequestVariables.limit,
            cursor: result.data.meta?.endCursor,
            status: filter.status,
            search: filter.search,
            priority: filter.priority,
          },
        },
      }),
  };
}

export { useInboxQueryByUrlQuery };
