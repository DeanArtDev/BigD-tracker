import { type TaskEntity, useAssignableTasksQuery } from '@/entity/planner/tasks';
import { useIsMobile } from '@/shared/ui-kit/helpers';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/shared/ui-kit/ui/combobox';
import { useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';

interface GroupTaskAutocompleteProps {
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly onTaskSelect: (taskId: number) => void;
}

function GroupTaskAutocomplete({ onTaskSelect, disabled, loading }: GroupTaskAutocompleteProps) {
  const [taskSearch, setTaskSearch] = useState<string>('');

  const isMobile = useIsMobile();
  const { tasks, isLoading } = useAssignableTasksQuery(
    { search: useDebounceValue(taskSearch, isMobile ? 1000 : 700)[0] },
    { staleTime: 0, gcTime: 0 },
  );

  return (
    <Combobox<TaskEntity>
      items={tasks}
      itemToStringLabel={(task) => task.name}
      autoHighlight
      disabled={disabled}
      inputValue={taskSearch}
      onValueChange={(task) => {
        if (task != null) {
          setTaskSearch('');
          onTaskSelect(task.id);
        }
      }}
      onInputValueChange={(inputValue, eventDetails) => {
        if (['item-press', 'none'].every((i) => i !== eventDetails.reason)) {
          setTaskSearch(inputValue);
        }
      }}
    >
      <ComboboxInput value={taskSearch} className="w-full" placeholder="Поиск по делам">
        {(loading || isLoading) && <AppLoader size={14} />}
      </ComboboxInput>

      <ComboboxContent aria-busy={loading || isLoading}>
        <ComboboxEmpty className="px-3 justify-start">Свободных дел не найдено 💁🏼‍♂️</ComboboxEmpty>

        <ComboboxList>
          {(task) => (
            <ComboboxItem key={task.id} value={task}>
              {task.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export { GroupTaskAutocomplete, type GroupTaskAutocompleteProps };
