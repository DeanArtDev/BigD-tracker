import { useQuery } from '@apollo/client/react';
import { GroupId } from '@/entity/planner/groups';
import { BrandTask } from '@/entity/planner/tasks';
import { Override } from '@/shared/lib';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import {
  GetAssignableTasksQuery,
  shapeGetAssignableTasksOptions,
  useExtendApolloErrorResult,
} from '@/shared/transport/graphql';

type AssignableTask = Override<BrandTask<GetAssignableTasksQuery['getAssignableTasks'][0]>, { groupId?: GroupId }>;
const EMPTY: AssignableTask[] = [];

function useGetAssignableTasks(input: { search?: string; groupIds?: GroupId[] }) {
  const result = useQuery(
    ...shapeGetAssignableTasksOptions(input, { skip: input.search == null || input.search.length <= 0 }),
  );

  const initialLoading = result.networkStatus === 1 && result.data == null;

  const { appErrors, isError } = useExtendApolloErrorResult(result.error);
  useExceptionNotificator({ exception: appErrors.at(-1) });

  const assignableTasks: AssignableTask[] = (result.data?.getAssignableTasks as AssignableTask[]) ?? EMPTY;

  return {
    ...result,
    isError,
    initialLoading,
    assignableTasks,
  };
}

export { useGetAssignableTasks, type AssignableTask };
