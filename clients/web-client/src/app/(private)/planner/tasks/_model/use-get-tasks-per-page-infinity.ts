import { useEffect, useRef, useState } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { TaskId } from '@/entity/planner/tasks';
import {
  ApiError,
  GetTasksPerPageSortInput,
  isApiError,
  TaskPriority,
  TaskStatus,
  useGetTasksPerPage,
} from '@/shared/transport/graphql';

const tasksRequestLimit = 12;
const initialFetchMorePageCount = 2;

function useGetTasksPerPageInfinity(input: {
  status: TaskStatus[];
  priority?: TaskPriority[];
  search?: string;
  sort?: GetTasksPerPageSortInput;
  recurring?: boolean;
  groupIds?: GroupId[];
}) {
  const { status, priority, search, sort, recurring, groupIds } = input;
  const inputKey = JSON.stringify(input);
  const pageRef = useRef(initialFetchMorePageCount);

  const result = useGetTasksPerPage<GroupId, TaskId>({
    page: 1,
    perPage: tasksRequestLimit,
    status,
    priority,
    search,
    sort,
    recurring,
    groupIds,
  });

  const [appError, setAppError] = useState<ApiError>();

  useEffect(() => {
    pageRef.current = initialFetchMorePageCount;
  }, [inputKey]);

  useEffect(() => {
    if (result.networkStatus === 4) pageRef.current = initialFetchMorePageCount;
  }, [result.networkStatus]);

  return {
    ...result,
    isError: result?.isError || appError != null,

    fetchMore: async () => {
      try {
        setAppError(undefined);
        const response = await result.fetchMore({
          variables: {
            input: {
              page: pageRef.current,
              perPage: tasksRequestLimit,
              status,
              priority,
              search,
              sort,
              recurring,
              groupIds,
            },
          },
        });

        if (response.data != null) ++pageRef.current;
      } catch (error) {
        if (isApiError(error)) setAppError(error);
      }
    },
  };
}

export { useGetTasksPerPageInfinity };
