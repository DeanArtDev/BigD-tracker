import { useEffect, useRef } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { TaskId } from '@/entity/planner/tasks';
import { GetTasksPerPageSortInput, TaskPriority, TaskStatus, useGetTasksPerPage } from '@/shared/transport/graphql';

const tasksRequestLimit = 12;

function useGetTasksPerPageInfinity(input: {
  status: TaskStatus[];
  priority?: TaskPriority[];
  search?: string;
  sort?: GetTasksPerPageSortInput;
  recurring?: boolean;
}) {
  const { status, priority, search, sort, recurring } = input;
  const inputKey = JSON.stringify(input);
  const pageRef = useRef(1);

  const result = useGetTasksPerPage<GroupId, TaskId>({
    page: 1,
    perPage: tasksRequestLimit,
    status,
    priority,
    search,
    sort,
    recurring,
  });

  useEffect(() => {
    pageRef.current = 1;
  }, [inputKey]);

  useEffect(() => {
    if (result.networkStatus === 4) pageRef.current = 1;
  }, [result.networkStatus]);

  return {
    ...result,
    fetchMore: () =>
      result
        .fetchMore({
          variables: {
            input: {
              page: pageRef.current,
              perPage: tasksRequestLimit,
              status,
              priority,
              search,
              sort,
              recurring,
            },
          },
        })
        .then(() => {
          ++pageRef.current;
        }),
  };
}

export { useGetTasksPerPageInfinity };
