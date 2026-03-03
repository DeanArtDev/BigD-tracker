import { TaskCreation } from '@/feature/planner/tasks/task-creation';
import { AppManipulatorContainer } from '@/shared/components/app-manipulator-container';
import { ButtonAdd } from '@/shared/components/button-add';
import { ManipulatorSearch } from '@/shared/components/manipulator-search';
import { cn } from '@/shared/ui-kit/utils';
import { useState } from 'react';
import { useTaskPageUrlQuery } from '../../lib/use-task-page-url-query';
import { FilterPriorityList } from './components/filter-priority-list';
import { FilterStatusList } from './components/filter-status-list';
import { SortListPopover } from './components/sort-list-popover';

function TasksPageManipulator() {
  const { pageQuery, setPageQuery } = useTaskPageUrlQuery();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <AppManipulatorContainer
      items={[
        searchOpen ? { key: '1', element: <div className="w-[56px]" /> } : null,
        searchOpen ? { key: '2', element: <div className="w-[56px]" /> } : null,
        {
          key: 'sort',
          className: cn({ 'opacity-0': searchOpen }),
          element: (
            <SortListPopover
              sort={pageQuery?.sort}
              onSortChange={(sort) => {
                setPageQuery((prev) => ({ ...prev, sort: { ...prev.sort, ...sort } }));
              }}
            />
          ),
        },
        {
          key: 'filter',
          className: cn({ 'opacity-0': searchOpen }),
          element: (
            <FilterStatusList
              selectedStatuses={pageQuery?.filter?.status ?? []}
              onFilterChange={(statuses) => {
                setPageQuery((prev) => ({
                  ...prev,
                  filter: { ...prev.filter, status: statuses },
                }));
              }}
            />
          ),
        },
        {
          key: 'priority',
          className: cn({ 'opacity-0': searchOpen }),
          element: (
            <FilterPriorityList
              priority={pageQuery?.filter?.priority}
              onFilterChange={(priority) => {
                setPageQuery((prev) => ({ ...prev, filter: { ...prev.filter, priority } }));
              }}
            />
          ),
        },
        {
          key: 'add-task',
          className: cn({ 'opacity-0': searchOpen }),
          element: (
            <TaskCreation
              trigger={<ButtonAdd variant="outline" size="icon-lg" iconProps={{ className: 'size-7' }} />}
            />
          ),
        },
        {
          key: 'search',
          element: (
            <ManipulatorSearch
              open={searchOpen}
              placeholder="Поиск по делам"
              className="inset-1.5 w-[calc(100%-56px)]"
              search={pageQuery?.search}
              onOpenChange={setSearchOpen}
              onSearchChange={(search) => {
                setPageQuery((prev) => ({ ...prev, search }));
              }}
            />
          ),
        },
      ].filter(Boolean)}
    />
  );
}

export { TasksPageManipulator };
