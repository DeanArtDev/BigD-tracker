import { taskDtoToEntity } from '@/entity/planner/tasks';
import { $privetQueryClient } from '@/shared/api/api-client';
import type { ApiSchemas } from '@/shared/api/types';
import { keyBy } from 'lodash-es';
import { type GroupEntity, GroupStatus } from '../group.entity';
import { groupsQueryKeys } from './query';

function useGroupsQuery(params: { search?: string; limit: number }) {
  const { data, ...others } = $privetQueryClient.useInfiniteQuery(...groupsQueryKeys.getGroups(params), {
    initialPageParam: null,
    getNextPageParam: (lastPage: ApiSchemas['GetUserGroupsRes']) => lastPage.data.meta.cursor,
    select: ({ pages = [] }: { pages: ApiSchemas['GetUserGroupsRes'][] }) => {
      const byPage = pages.map((page) => {
        const items = page.data.items.map((group) => ({
          id: group.id,
          name: group.name,
          description: group.description,
          status: group.status as GroupStatus,
          progress: group.progress,
          tasks: group.tasks.map(taskDtoToEntity),
        }));

        return {
          items: items,
          byId: keyBy(items, 'id'),
        };
      });

      const allItems = byPage.reduce<{
        items: GroupEntity[];
        byId: Record<number, GroupEntity>;
      }>(
        (acc, { items, byId }) => {
          acc.items.push(...items);
          acc.byId = { ...acc.byId, ...byId };
          return acc;
        },
        { items: [], byId: {} },
      );

      return { pages: byPage, allItems };
    },
  });

  return {
    pages: data?.pages,
    groupList: data?.allItems.items,
    groupById: data?.allItems.byId,
    isEmpty: data == null || data?.allItems.items.length <= 0,
    ...others,
  };
}

export { useGroupsQuery };
