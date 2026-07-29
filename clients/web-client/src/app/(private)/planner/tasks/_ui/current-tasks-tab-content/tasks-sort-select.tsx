'use client';

import { ArrowDownWideNarrow, ArrowUpDown, ArrowUpNarrowWide } from 'lucide-react';
import { useGetTasksPerPageCurrent } from '@/app/(private)/planner/tasks/_model/use-get-tasks-per-page-current';
import { FilterResetButton, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui-kit';
import { TasksSort } from '../../_model/use-tasks-url-query';

function TasksSortSelect() {
  const { setSearchQuery, sort } = useGetTasksPerPageCurrent();

  return (
    <Select
      value={sort ?? ''}
      onValueChange={(value) => {
        setSearchQuery((previousQuery) => ({
          ...previousQuery,
          sort: value as TasksSort,
        }));
      }}
    >
      <div className="relative">
        <SelectTrigger className="w-[150px] hover:bg-muted data-placeholder:hover:text-foreground">
          <SelectValue
            aria-placeholder="Сортировка"
            placeholder={
              <>
                <ArrowUpDown />
                Сортировка
              </>
            }
          />
        </SelectTrigger>

        {sort != null && (
          <FilterResetButton
            className="absolute -top-2.5 -right-2.5"
            onReset={() => {
              setSearchQuery((previousQuery) => ({
                ...previousQuery,
                sort: undefined,
              }));
            }}
          />
        )}
      </div>

      <SelectContent className="p-1" align="start" position="popper">
        <SelectItem value="startDateAsc">
          <ArrowUpNarrowWide />
          Дата начала: сначала ранние
        </SelectItem>
        <SelectItem value="startDateDesc">
          <ArrowDownWideNarrow />
          Дата начала: сначала поздние
        </SelectItem>
        <SelectItem value="deadlineAsc">
          <ArrowUpNarrowWide />
          Дедлайн: сначала ранние
        </SelectItem>
        <SelectItem value="deadlineDesc">
          <ArrowDownWideNarrow />
          Дедлайн: сначала поздние
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

export { TasksSortSelect };
