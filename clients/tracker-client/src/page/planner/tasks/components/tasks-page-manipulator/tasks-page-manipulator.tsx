import { TaskCreation } from '@/feature/planner/tasks/task-creation';
import { TaskSearch } from './components/task-search';
import { ButtonAdd } from '@/shared/components/button-add';
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
    <div
      className={cn(
        'tasks-page-manipulator',
        'fixed bottom-4 md:bottom-8 inset-x-0 mx-auto',
        'w-fit',
        'bg-secondary border-2 rounded-2xl shadow-lg',
      )}
    >
      <ul className={cn('flex flex-nowrap gap-2 p-1.5 relative')}>
        <li className={cn({ 'opacity-0': searchOpen })}>
          <SortListPopover
            sort={pageQuery?.sort}
            onSortChange={(sort) => {
              setPageQuery((prev) => ({ ...prev, sort: { ...prev.sort, ...sort } }));
            }}
          />
        </li>

        <li className={cn({ 'opacity-0': searchOpen })}>
          <FilterStatusList
            selectedStatuses={pageQuery?.filter?.status ?? []}
            onFilterChange={(statuses) => {
              setPageQuery((prev) => ({ ...prev, filter: { ...prev.filter, status: statuses } }));
            }}
          />
        </li>

        <li className={cn({ 'opacity-0': searchOpen })}>
          <FilterPriorityList
            priority={pageQuery?.filter?.priority}
            onFilterChange={(priority) => {
              setPageQuery((prev) => ({ ...prev, filter: { ...prev.filter, priority } }));
            }}
          />
        </li>

        <li className={cn({ 'opacity-0': searchOpen })}>
          <TaskCreation
            trigger={
              <ButtonAdd variant="outline" size="icon-lg" iconProps={{ className: 'size-7' }} />
            }
          />
        </li>

        <li>
          <TaskSearch
            open={searchOpen}
            search={pageQuery?.search}
            onOpenChange={setSearchOpen}
            onSearchChange={(search) => {
              setPageQuery((prev) => ({ ...prev, search }));
            }}
          />
        </li>
      </ul>
    </div>
  );
}

export { TasksPageManipulator };
