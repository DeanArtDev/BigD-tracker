'use client';

import { SearchX } from 'lucide-react';
import Link from 'next/link';
import { GroupId } from '@/entity/planner/groups';
import { useGroupDeleteFeature } from '@/feature/planner/group-delete';
import { useGroupUpdateFeature } from '@/feature/planner/group-update';
import { routes } from '@/shared/routes';
import { DataLoader, VirtualizedInfinityScroll } from '@/shared/ui-kit';
import { GroupCard } from './group-card';
import { useGetGroupListByUrlQuery } from '../../_model/use-get-group-list-by-url-query';

function GroupList() {
  const { groups, meta, hasSearch, loading, initialLoading, isEmpty, isError, fetchMore, refetch } =
    useGetGroupListByUrlQuery();

  const { isGroupDeleteLoading, deleteGroup } = useGroupDeleteFeature();
  const { isGroupUpdateLoading, updateGroup } = useGroupUpdateFeature();

  return (
    <DataLoader
      isLoading={initialLoading}
      isEmpty={isEmpty && hasSearch}
      isError={isError}
      errorElement={<DataLoader.Error onRetry={refetch} />}
      emptyElement={
        <DataLoader.Empty
          title="Ничего не нашлось"
          icon={<SearchX className="size-7 text-muted-foreground" strokeWidth={2} />}
        />
      }
    >
      <ul className="flex flex-col min-w-0 min-h-0">
        <VirtualizedInfinityScroll
          infinityScrollOptions={{ bottomGap: 100 }}
          virtualizerOptions={{ gap: 0, overscan: 5, count: groups.length ?? 0, estimateSize: () => 69 }}
          hasNextPage={meta?.hasNextPage ?? false}
          onNextPageLoad={fetchMore}
          isLoadingNextPage={loading}
          renderItem={(virtualItem) => {
            const group = groups[virtualItem.index];
            if (group == null) return null;

            return (
              <Link href={routes.plannerGroup.link<GroupId>({ groupId: group.id })}>
                <GroupCard
                  key={group.id}
                  id={group.id}
                  name={group.name}
                  loading={isGroupDeleteLoading || isGroupUpdateLoading}
                  onNameChange={(name) =>
                    void updateGroup({ name, id: group.id, description: undefined, taskIds: undefined })
                  }
                  onDelete={deleteGroup}
                />
              </Link>
            );
          }}
        />
      </ul>
    </DataLoader>
  );
}

export { GroupList };
