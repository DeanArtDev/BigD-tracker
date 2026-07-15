import { SearchX } from 'lucide-react';
import { useGroupDeleteFeature } from '@/feature/planner/group-delete';
import { useGroupUpdateFeature } from '@/feature/planner/group-update';
import { DataLoader, VirtualizedInfinityScroll } from '@/shared/ui-kit';
import { GroupCard } from './group-card';
import { useGetGroupListByUrlQuery } from '../../_model/use-get-group-list-by-url-query';

function GroupList() {
  const { groups, meta, loading, isEmpty, isError, fetchMore, refetch } = useGetGroupListByUrlQuery();

  const { isGroupDeleteLoading, deleteGroup } = useGroupDeleteFeature();
  const { isGroupUpdateLoading, updateGroup } = useGroupUpdateFeature();

  return (
    <DataLoader
      isLoading={loading}
      isEmpty={isEmpty}
      isError={isError}
      errorElement={<DataLoader.Error onRetry={refetch} />}
      emptyElement={
        <DataLoader.Empty
          title="Ничего не нашлось"
          icon={<SearchX className="size-7 text-muted-foreground" strokeWidth={2} />}
        />
      }
    >
      <ul className="flex flex-col">
        <VirtualizedInfinityScroll
          infinityScrollOptions={{ bottomGap: 400 }}
          virtualizerOptions={{ gap: 0, overscan: 5, count: groups.length ?? 0 }}
          hasNextPage={meta?.hasNextPage ?? false}
          onNextPageLoad={fetchMore}
          renderItem={(virtualItem) => {
            const group = groups[virtualItem.index];
            if (group == null) return null;

            return (
              <GroupCard
                key={group.id}
                id={group.id}
                name={group.name}
                loading={isGroupDeleteLoading || isGroupUpdateLoading}
                onNameChange={(name) =>
                  void updateGroup({ name, id: group.id, description: group.description ?? undefined })
                }
                onClick={() => void console.log('card click')}
                onDelete={(groupId) => void deleteGroup(groupId)}
              />
            );
          }}
        />
      </ul>
    </DataLoader>
  );
}

export { GroupList };
