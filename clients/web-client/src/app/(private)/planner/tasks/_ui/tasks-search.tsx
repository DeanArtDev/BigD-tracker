'use client';

import { AppSearchInput } from '@/shared/project-ui';
import { TasksTab, useTasksTabUrlQuery } from '../_model/use-tasks-url-query';

function TasksSearch({ tab }: { tab: TasksTab }) {
  const [searchQuery, setSearchQuery] = useTasksTabUrlQuery(tab);

  return (
    <AppSearchInput
      className="max-w-[420px] w-full"
      value={searchQuery?.search}
      placeholder="Поиск по имени..."
      onSearch={(search) => {
        setSearchQuery((previousQuery) => ({ ...previousQuery, search }));
      }}
    />
  );
}

export { TasksSearch };
