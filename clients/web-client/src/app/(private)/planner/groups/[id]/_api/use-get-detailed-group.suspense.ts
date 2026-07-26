import { useSuspenseQuery } from '@apollo/client/react';
import { exceptionCode } from '@big-d/exceptions';
import { GroupId } from '@/entity/planner/groups';
import { TaskId } from '@/entity/planner/tasks';
import { GroupTaskOrder } from '@/entity/schema-types';
import { Override } from '@/shared/lib';
import { useExceptionNotificator } from '@/shared/lib/exception-notificator';
import { shapeGetDetailedGroupOptions, useExtendApolloErrorResult } from '@/shared/transport/graphql';
import { GetDetailedGroupByIdQuery } from './schemas/group-page.schema.generated';

type DetailedGroupTask = Override<
  GetDetailedGroupByIdQuery['getGroup']['tasks']['items'][0],
  { id: TaskId; groupId: GroupId }
>;

type DetailedGroup = Override<
  GetDetailedGroupByIdQuery['getGroup'],
  { id: GroupId; tasks: { items: DetailedGroupTask[] } }
>;

type DetailedGroupQuery = Override<GetDetailedGroupByIdQuery, { getGroup: DetailedGroup }>;

const EMPTY_TASKS: DetailedGroupTask[] = [];

function useGetDetailedGroupSuspense({ groupId }: { groupId?: GroupId }) {
  const [document, options] = shapeGetDetailedGroupOptions<DetailedGroupQuery>({
    groupId,
    order: GroupTaskOrder.Group,
  }).suspense();

  const result = useSuspenseQuery(document, {
    variables: options.variables,
    context: options.context,
    errorPolicy: options.errorPolicy,
  });

  const { appErrors, isError } = useExtendApolloErrorResult(result.error);
  useExceptionNotificator({
    exception: appErrors.at(-1),
    messageHandlers: { [exceptionCode.groupNotFound.code]: () => 'Группа не найдена.' },
  });

  const { data } = result;

  return {
    ...result,
    isError,
    isEmpty: result.data?.getGroup == null,
    isEmptyTasks: (result.data?.getGroup.tasks.items.length ?? 0) <= 0,
    group: data?.getGroup,
    tasks: data?.getGroup.tasks.items ?? EMPTY_TASKS,
  };
}

export { useGetDetailedGroupSuspense, type DetailedGroupTask };
