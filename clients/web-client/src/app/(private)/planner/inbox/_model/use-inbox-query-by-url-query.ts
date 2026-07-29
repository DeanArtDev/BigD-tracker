import { useState } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { TaskId } from '@/entity/planner/tasks';
import { ApiError, inboxInitialRequestVariables, useInboxQuery } from '@/shared/transport/graphql';
import { useInboxUrlQuery } from './use-inbox-url-query';

function useInboxQueryByUrlQuery() {
  const [searchQuery] = useInboxUrlQuery();

  const filter = {
    search: searchQuery?.search,
    status: searchQuery?.status,
    priority: searchQuery?.priority,
  };

  const result = useInboxQuery<GroupId, TaskId>({ search: searchQuery?.search, filter });

  const [apiError, setApiError] = useState<ApiError>();

  return {
    ...result,
    isError: result.isError || apiError != null,

    fetchMore: async () => {
      try {
        setApiError(undefined);
        await result.fetchMore({
          variables: {
            input: {
              limit: inboxInitialRequestVariables.limit,
              cursor: result.data.meta?.endCursor,
              status: filter.status,
              search: filter.search,
              priority: filter.priority,
            },
          },
        });
      } catch (error) {
        if (error instanceof ApiError) {
          setApiError(error);
        }
      }
    },
  };
}

export { useInboxQueryByUrlQuery };
