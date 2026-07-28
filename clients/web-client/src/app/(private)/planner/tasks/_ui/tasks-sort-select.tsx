'use client';

import { ArrowDownWideNarrow, ArrowUpDown, ArrowUpNarrowWide, X } from 'lucide-react';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui-kit';
import { TasksSort, useTasksUrlQuery } from '../_model/use-tasks-url-query';

function TasksSortSelect() {
  const [searchQuery, setSearchQuery] = useTasksUrlQuery();

  return (
    <Select
      value={searchQuery?.sort ?? ''}
      onValueChange={(value) => {
        setSearchQuery((previousQuery) => ({
          ...previousQuery,
          sort: value as TasksSort,
        }));
      }}
    >
      <div className="relative">
        <SelectTrigger className="w-[150px]">
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

        {searchQuery?.sort != null && (
          <Button
            type="button"
            size="icon-sm"
            variant="destructive"
            className="absolute -top-2.5 -right-2.5 size-5.5 rounded-xl p-0"
            onClick={(event) => {
              event.stopPropagation();
              setSearchQuery((previousQuery) => ({
                ...previousQuery,
                sort: undefined,
              }));
            }}
          >
            <X className="size-4" />
          </Button>
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
