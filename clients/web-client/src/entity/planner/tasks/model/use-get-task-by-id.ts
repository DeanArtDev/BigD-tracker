import { useQuery } from '@apollo/client/react';
import { GroupId } from '@/entity/planner/groups';
import { Override } from '@/shared/lib';
import { TaskId } from './domain/task';
import { TaskByIdQueryVariables, TaskByIdDocument, TaskByIdQuery } from './schemas/tasks.schema.generated';

type ResponseQuery = Override<
  NonNullable<TaskByIdQuery>,
  {
    getTaskById: Override<NonNullable<TaskByIdQuery>['getTaskById'], { id: TaskId; groupId?: GroupId }>;
  }
>;

function useGetTaskById({ id }: { id?: TaskId }) {
  const { data, ...rest } = useQuery<ResponseQuery, TaskByIdQueryVariables>(TaskByIdDocument, {
    variables: { input: { id: id! } },
    fetchPolicy: 'cache-first',
    skip: id == null,
    context: { endpoint: 'private' },
  });

  return {
    task: data?.getTaskById,
    ...rest,
  };
}

export { useGetTaskById };
