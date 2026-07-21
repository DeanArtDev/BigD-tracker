import type { WatchQueryFetchPolicy } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { exceptionCode } from '@big-d/exceptions';
import { GroupId } from '@/entity/planner/groups';
import { TaskId } from '@/entity/planner/tasks';
import { Override } from '@/shared/lib';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { useExtendApolloErrorResult } from '@/shared/transport/graphql';
import {
  GetDetailedGroupByIdDocument,
  GetDetailedGroupByIdQueryVariables,
  GetDetailedGroupByIdQuery,
} from './schemas/group-page.schema.generated';

type DetailedGroupTask = Override<GetDetailedGroupByIdQuery['getGroup']['tasks']['items'][0], { id: TaskId }>;

type DetailedGroup = Override<
  GetDetailedGroupByIdQuery['getGroup'],
  { id: GroupId; tasks: { items: DetailedGroupTask[] } }
>;

type DetailedGroupQuery = Override<GetDetailedGroupByIdQuery, { getGroup: DetailedGroup }>;

const EMPTY_TASKS: DetailedGroupTask[] = [];

function useGetDetailedGroup({ groupId }: { groupId?: number }, options?: { fetchPolicy: WatchQueryFetchPolicy }) {
  const result = useQuery<DetailedGroupQuery, GetDetailedGroupByIdQueryVariables>(GetDetailedGroupByIdDocument, {
    context: { endpoint: 'private' },
    variables: { input: { groupId: groupId! } },
    skip: groupId == null,
    ...options,
  });

  const initialLoading = result.networkStatus === 1 && result.data == null;

  const { appErrors, isError } = useExtendApolloErrorResult(result.error);
  useExceptionNotificator({
    exception: appErrors.at(-1),
    messageHandlers: { [exceptionCode.groupNotFound.code]: () => 'Группа не найдена.' },
  });

  const { data } = result;

  return {
    ...result,
    isError,
    initialLoading,
    isEmpty: !initialLoading && !result.loading && result.data?.getGroup == null,
    isEmptyTasks: !initialLoading && !result.loading && (result.data?.getGroup.tasks.items.length ?? 0) <= 0,
    group: data?.getGroup,
    tasks: data?.getGroup.tasks.items ?? EMPTY_TASKS,
  };
}

export { useGetDetailedGroup, type DetailedGroupTask, type DetailedGroup };
