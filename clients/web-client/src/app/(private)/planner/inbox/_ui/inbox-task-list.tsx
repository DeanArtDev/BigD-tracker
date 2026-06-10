'use client';

import { SearchX } from 'lucide-react';
import { memo } from 'react';
import { TaskList } from '@/entity/planner/tasks';
import { EmptyTasksPlaceholder } from './empty-inbox-tasks.placeholder';
import { useInboxQueryByUrlQuery } from '../_model/use-inbox-query-by-url-query';

const InboxTaskList = memo(function InboxTaskListMemo() {
  const { data, isError, isEmpty, refetch, loading, initialLoading, fetchMore } = useInboxQueryByUrlQuery();

  const tasks = data.tasks ?? [];
  const count = tasks?.length ?? 0;
  const hasNextPage = data.meta?.hasNextPage ?? false;

  return (
    <TaskList
      tasks={tasks}
      virtualizerProps={{
        hasNextPage,
        virtualizerOptions: { count },
        isLoadingNextPage: loading,
        infinityScrollOptions: {
          bottomGap: 400,
        },
        onNextPageLoad: fetchMore,
      }}
      dataLoaderProps={{
        isError,
        isLoading: initialLoading,
        isEmpty,
        emptyElement: (
          <EmptyTasksPlaceholder
            title="Ничего не нашлось"
            description="Попробуй изменить запрос или сбросить фильтры."
            icon={<SearchX className="size-7 text-muted-foreground" strokeWidth={2} />}
          />
        ),
      }}
      onRetry={refetch}
    />
  );
});

export { InboxTaskList };
