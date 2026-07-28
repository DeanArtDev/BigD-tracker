'use client';

import { AppSearchInput } from '@/shared/project-ui';
import { useTasksUrlQuery } from '../_model/use-tasks-url-query';

function TasksSearch() {
  const [searchQuery, setSearchQuery] = useTasksUrlQuery();

  return (
    <AppSearchInput
      value={searchQuery?.search}
      placeholder="Поиск по имени..."
      onSearch={(search) => {
        setSearchQuery((previousQuery) => ({ ...previousQuery, search }));
      }}
    />
  );
}

export { TasksSearch };
