'use client';

import { ChevronsUpDown, FolderSearch } from 'lucide-react';
import { GroupId } from '@/entity/planner/groups';
import { Badge, Button, FilterResetButton, Popover, PopoverContent, PopoverTrigger } from '@/shared/ui-kit';
import { TasksGroupsSelectContent } from './tasks-groups-select-content';
import { useTasksTabUrlQuery } from '../../../_model/use-tasks-url-query';

function TasksGroupsSelect() {
  const [searchQuery, setSearchQuery] = useTasksTabUrlQuery('current');

  const selectedGroupIds = (searchQuery?.groupIds ?? []) as GroupId[];
  const hasSelectedGroups = selectedGroupIds.length > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative">
          <Button type="button" variant="outline" className="text-muted-foreground">
            <FolderSearch />
            Группы
            <ChevronsUpDown className="text-muted-foreground" />
          </Button>

          {hasSelectedGroups && (
            <div className="group absolute -top-2.5 -right-2.5 flex size-5 items-center justify-center">
              <FilterResetButton
                className="hidden group-hover:flex"
                onReset={() => {
                  setSearchQuery((previousQuery) => ({
                    ...previousQuery,
                    groupIds: undefined,
                  }));
                }}
              />

              <Badge className="size-5 rounded-xl p-0 group-hover:hidden">{selectedGroupIds.length}</Badge>
            </div>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-[330px] p-1" align="end">
        <TasksGroupsSelectContent />
      </PopoverContent>
    </Popover>
  );
}

export { TasksGroupsSelect };
