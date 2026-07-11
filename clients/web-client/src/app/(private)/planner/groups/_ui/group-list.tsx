import { SearchX } from 'lucide-react';
import { DataLoader, VirtualizedInfinityScroll } from '@/shared/ui-kit';
import { useGetGroupListByUrlQuery } from '../_model/use-get-group-list-by-url-query';

function GroupList() {
  const { groups, meta, loading, isEmpty, isError, fetchMore, refetch } = useGetGroupListByUrlQuery();

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
              <li key={group.id} className="p-5 border-b">
                {group.name}
              </li>
            );
          }}
        />
      </ul>
    </DataLoader>
  );
}

export { GroupList };
