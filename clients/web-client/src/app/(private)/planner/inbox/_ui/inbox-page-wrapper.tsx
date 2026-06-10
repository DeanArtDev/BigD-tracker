'use client';

import { debounce } from 'lodash-es';
import { useMemo } from 'react';
import { DataLoader, Typography } from '@/shared/ui-kit';
import { EmptyTasksPlaceholder } from './empty-inbox-tasks.placeholder';
import { InboxManipulationBlock } from './inbox-manipulation-block';
import { InboxTaskList } from './inbox-task-list';
import { useInboxQueryByUrlQuery } from '../_model/use-inbox-query-by-url-query';
import { UseInboxUrlQuery, useInboxUrlQuery } from '../_model/use-inbox-url-query';

function InboxPageWrapper() {
  const [, setSearchQuery] = useInboxUrlQuery();
  const { isEmpty, initialLoading } = useInboxQueryByUrlQuery();

  const setter = useMemo(() => {
    return debounce(
      (params: UseInboxUrlQuery) => {
        setSearchQuery((prev) => ({ ...prev, ...params }));
      },
      400,
      { leading: true, trailing: false },
    );
  }, [setSearchQuery]);

  return (
    <div className="grow grid grid-rows-[min-content_max-content_1fr] min-h-0 min-w-0 gap-3 px-8 py-5">
      <Typography.H2>INBOX</Typography.H2>

      <DataLoader isEmpty={isEmpty && initialLoading} emptyElement={<EmptyTasksPlaceholder />}>
        <InboxManipulationBlock
          onSearchChange={(search) => {
            setter({ search });
          }}
          onFiltersChange={(filters) => {
            setter({ priority: filters.priority?.map(String), status: filters.status });
          }}
        />

        <InboxTaskList />
      </DataLoader>
    </div>
  );
}

export { InboxPageWrapper };
