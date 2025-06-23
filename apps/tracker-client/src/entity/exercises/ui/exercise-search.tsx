import { useExerciseQuery } from '@/entity/exercises';
import type { ApiDto } from '@/shared/api/types';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { Button } from '@/shared/ui-kit/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui-kit/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui-kit/ui/popover';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useToggle } from 'usehooks-ts';

interface ExerciseSearchProps {
  readonly modal?: boolean;
  readonly onSelect: (exercises: ApiDto['ExerciseWithRepetitionsDto']) => void;
  readonly onDelete?: (exercises: ApiDto['ExerciseWithRepetitionsDto']) => void;
}

function ExerciseSearch({ modal, onSelect }: ExerciseSearchProps) {
  const [open, setOpen] = useState(false);
  const { 1: toggle } = useToggle();
  const { data, isLoading } = useExerciseQuery();

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modal}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={isLoading}
          aria-expanded={open}
          className="w-max justify-between"
        >
          Добавить упражнение
          {isLoading ? <AppLoader inverse size={20} /> : <Plus className="opacity-50" />}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-max p-0">
        <Command>
          <CommandInput placeholder="Search framework..." className="h-9" />

          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {data?.map((exercise) => (
                <CommandItem
                  key={exercise.id}
                  value={`${exercise.name}:${exercise.id}`}
                  onSelect={() => {
                    onSelect(exercise);
                    toggle();
                  }}
                >
                  {exercise.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { ExerciseSearch, type ExerciseSearchProps };
