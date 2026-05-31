import { GroupId } from '@/entity/planner/groups';
import { TaskEntity, TaskPriority } from '@/entity/planner/tasks';
import { Override } from '@/shared/lib/type-helpers';
import { useAppQuery } from '@/shared/transport/graphql';
import { GetInboxDocument, GetInboxQuery } from './schemas/inbox.queries.generated';

type TaskDto = NonNullable<GetInboxQuery['getInbox']['tasks'][number]>;
type Task = TaskEntity<Override<TaskDto, { priority: TaskPriority }>>;

type GetInboxResponse = Override<
  GetInboxQuery,
  {
    getInbox: Override<
      GetInboxQuery['getInbox'],
      {
        id: GroupId;
        tasks: Task[];
      }
    >;
  }
>;

function useInboxQuery() {
  const { data, ...rest } = useAppQuery<GetInboxResponse>(GetInboxDocument, {
    endpoint: 'private',
  });

  return {
    data: data?.getInbox,
    ...rest,
  };
}

export { useInboxQuery };
