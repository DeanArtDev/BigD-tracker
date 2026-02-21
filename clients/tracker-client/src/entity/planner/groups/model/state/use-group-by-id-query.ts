import { type GroupEntity, GroupStatus } from '@/entity/planner/groups';
import { taskDtoToEntity } from '@/entity/planner/tasks';
import { $privetQueryClient } from '@/shared/api/api-client';
import { groupsQueryKeys } from './query';

function useGroupByIdQuery(params: { groupId?: number }) {
  const { data, ...others } = $privetQueryClient.useQuery(
    ...groupsQueryKeys.getGroupById({ groupId: params.groupId! }),
    {
      enabled: params.groupId != null,
      select: ({ data: group }): GroupEntity => {
        return {
          id: group.id,
          name: group.name,
          description: group.description,
          status: group.status as GroupStatus,
          progress: group.progress,
          tasks: group.tasks.map(taskDtoToEntity),
        };
      },
    },
  );

  return {
    groupById: data,
    isEmpty: data == null,
    ...others,
  };
}

export { useGroupByIdQuery };
