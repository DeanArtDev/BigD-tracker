import { RepetitionForm } from '@/entity/exercises/ui';
import { Button } from '@/shared/ui-kit/ui/button';
import { ButtonChevron } from '@/shared/ui-kit/ui/button-chevron';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui-kit/ui/collapsible';
import { X } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import type { TrainingManageFormData } from '../training-template-manage-form';

interface ExerciseElementsProps {
  readonly name: string;
  readonly index: number;
  readonly disabled?: boolean;
  readonly beforeStartSlot?: ReactNode;
  readonly onRemove: (index: number) => void;
}

function ExerciseElements({ disabled, index, name, beforeStartSlot, onRemove }: ExerciseElementsProps) {
  const methods = useFormContext<TrainingManageFormData>();
  const { fields } = useFieldArray({
    name: `exercises.${index}.repetitions`,
    keyName: 'formUid',
    control: methods.control,
  });

  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="flex gap-2 items-center border rounded-md p-2 bg-white relative">
        {beforeStartSlot}

        <span>{index + 1}.</span>

        <span className="text-sm">{name}</span>

        <CollapsibleTrigger asChild>
          <ButtonChevron
            open={open}
            className="ml-auto"
            disabled={disabled}
            onClick={() => void setOpen((prev) => !prev)}
          />
        </CollapsibleTrigger>

        <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => void onRemove(index)}>
          <X />
        </Button>
      </div>

      <CollapsibleContent className="ml-[10%] mt-[-10px] pt-4 p-2 overflow-hidden text-xs border-x border-b rounded-bl-md rounded-br-md">
        <ul className="flex flex-col grow gap-3">
          {fields.map((rep, idx) => {
            return (
              <RepetitionForm<TrainingManageFormData>
                key={rep.formUid}
                index={idx}
                weightName={`exercises.${index}.repetitions.${idx}.targetWeight`}
                countName={`exercises.${index}.repetitions.${idx}.targetCount`}
                breakName={`exercises.${index}.repetitions.${idx}.targetBreak`}
              />
            );
          })}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

export { ExerciseElements, type ExerciseElementsProps };
