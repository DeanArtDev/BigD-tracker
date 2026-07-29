'use client';

import { FilterResetButton, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui-kit';
import { useGetTasksPerPageCurrent } from '../../_model/use-get-tasks-per-page-current';
import { TasksRecurrence } from '../../_model/use-tasks-url-query';

function TasksRecurrenceSelect() {
  const { setSearchQuery, recurring } = useGetTasksPerPageCurrent();

  return (
    <Select
      value={recurring ?? ''}
      onValueChange={(value) => {
        setSearchQuery((previousQuery) => ({
          ...previousQuery,
          recurring: value as TasksRecurrence,
        }));
      }}
    >
      <div className="relative">
        <SelectTrigger className="w-[190px] hover:bg-muted data-placeholder:hover:text-foreground">
          <SelectValue placeholder="Повторяемость" />
        </SelectTrigger>

        {recurring != null && (
          <FilterResetButton
            className="absolute -top-2.5 -right-2.5"
            onReset={() => {
              setSearchQuery((previousQuery) => ({
                ...previousQuery,
                recurring: undefined,
              }));
            }}
          />
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
