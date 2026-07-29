import { useState } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { ApiError, useGetGroupList } from '@/shared/transport/graphql';
import { useGroupListUrlQuery } from './use-group-list-url-query';

const requestLimit = 17;

function useGetGroupListByUrlQuery() {
  const [searchQuery] = useGroupListUrlQuery();

  const search = searchQuery?.search;

  const result = useGetGroupList<GroupId>({ limit: requestLimit, search });

  const [apiError, setApiError] = useState<ApiError>();

  return {
    ...result,
    initialLoading: result.networkStatus === 1 && result.data == null,
    hasSearch: (search?.trim().length ?? 0) > 0,
    isError: result.isError || apiError != null,

    fetchMore: async () => {
      try {
        setApiError(undefined);
        await result.fetchMore({
          variables: {
            input: {
              limit: requestLimit,
              cursor: result.meta?.endCursor,
              search,
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

export { useGetGroupListByUrlQuery };
