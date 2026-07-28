'use client';

import { X } from 'lucide-react';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui-kit';
import { TasksRecurrence, useTasksUrlQuery } from '../_model/use-tasks-url-query';

function TasksRecurrenceSelect() {
  const [searchQuery, setSearchQuery] = useTasksUrlQuery();

  return (
    <Select
      value={searchQuery?.recurring ?? ''}
      onValueChange={(value) => {
        setSearchQuery((previousQuery) => ({
          ...previousQuery,
          recurring: value as TasksRecurrence,
        }));
      }}
    >
      <div className="relative">
        <SelectTrigger className="w-[190px]">
          <SelectValue placeholder="Повторяемость" />
        </SelectTrigger>

        {searchQuery?.recurring != null && (
          <Button
            type="button"
            size="icon-sm"
            variant="destructive"
            className="absolute -top-2.5 -right-2.5 size-5.5 rounded-xl p-0"
            onClick={(event) => {
              event.stopPropagation();
              setSearchQuery((previousQuery) => ({
                ...previousQuery,
                recurring: undefined,
              }));
            }}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      <SelectContent className="p-1" align="start" position="popper">
        <SelectItem value="onlyRecurring">Повторяемые</SelectItem>
        <SelectItem value="onlyNonRecurring">Неповторяемые</SelectItem>
      </SelectContent>
    </Select>
  );
}

export { TasksRecurrenceSelect };
