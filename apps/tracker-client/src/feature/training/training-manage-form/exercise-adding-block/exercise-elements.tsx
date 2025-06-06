import { Button } from '@/shared/ui-kit/ui/button';
import { FormControl, FormField, FormItem } from '@/shared/ui-kit/ui/form';
import { Input } from '@/shared/ui-kit/ui/input';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ExerciseElementsProps {
  readonly id: number;
  readonly name: string;
  readonly index: number;
  readonly disabled?: boolean;
  readonly beforeStartSlot?: ReactNode;
  readonly onRemove: (index: number) => void;
}

function ExerciseElements({
  id,
  disabled,
  name,
  index,
  beforeStartSlot,
  onRemove,
}: ExerciseElementsProps) {
  return (
    <div key={id} className="flex gap-2 items-center border rounded-md p-2">
      {beforeStartSlot}

      <span>{index + 1}.</span>

      <span className="text-sm">{name}</span>

      <div className="grid grid-cols-[50px_min-content_50px] gap-2 items-center ml-auto">
        <FormField
          name={`exerciseList.${index}.sets`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input className="px-1 text-center" type="number" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        /
        <FormField
          name={`exerciseList.${index}.repetitions`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input className="px-1 text-center" type="number" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() => void onRemove(index)}
      >
        <X />
      </Button>
    </div>
  );
}

export { ExerciseElements, type ExerciseElementsProps };
