'use client';

import { memo } from 'react';
import { TaskPriorityPicker, TaskStatusSelect } from '@/entity/planner/tasks';
import { AppSearchInput } from '@/shared/project-ui';
import { UseInboxUrlQuery, useInboxUrlQuery } from '../_model/use-inbox-url-query';

const InboxManipulationBlock = memo(function InboxManipulationBlockMemo() {
  const [searchQuery, setSearchQuery] = useInboxUrlQuery();

  const filter = {
    search: searchQuery?.search,
    status: searchQuery?.status,
    priority: searchQuery?.priority ?? [],
  };

  const setSearch = (search: string | undefined) => void setSearchQuery((prev) => ({ ...prev, search }));
  const setFilters = ({ status, priority }: Pick<UseInboxUrlQuery, 'status' | 'priority'>) => {
    setSearchQuery((prev) => ({ ...prev, priority, status }));
  };

  return (
    <div className="flex gap-5 items-center">
      <AppSearchInput
        className="max-w-[420px] w-full"
        value={filter.search}
        placeholder="Поиск по имени..."
        onSearch={setSearch}
      />

      <TaskPriorityPicker
        className="ml-auto"
        value={filter.priority}
        onChange={(values) => {
          const v = values.length <= 0 ? undefined : values;
          setFilters({ priority: v, status: filter.status });
        }}
      />

      <TaskStatusSelect
        values={filter.status}
        onChange={(value) => {
          setFilters({ priority: filter.priority, status: value });
        }}
      />
    </div>
  );
});

export { InboxManipulationBlock };
