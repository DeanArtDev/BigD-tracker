import { RepetitionForm } from '@/entity/exercises/ui';
import { Button } from '@/shared/ui-kit/ui/button';
import { Separator } from '@/shared/ui-kit/ui/separator';
import { Plus, X } from 'lucide-react';
import { Fragment } from 'react';
import type { ManageExerciseTemplateFormData } from './manage-exercise-template-form';
import { useFieldArray, useFormContext } from 'react-hook-form';

function RepetitionsBlock() {
  const methods = useFormContext<ManageExerciseTemplateFormData>();
  const { fields, append, remove } = useFieldArray({
    name: `repetitions`,
    keyName: 'formUid',
    control: methods.control,
  });

  return (
    <div className="flex flex-col grow">
      <Button
        size="sm"
        variant="outline"
        type="button"
        className="ml-auto mb-5"
        onClick={() => {
          if (fields.length === 20) return;
          append({
            targetBreak: null,
            targetCount: null,
            targetWeight: null,
          });
        }}
      >
        <Plus />
        <span>Добавить подход</span>
      </Button>

      <div className="flex flex-col gap-4">
        {fields.map((rep, index) => {
          return (
            <Fragment key={rep.formUid}>
              <RepetitionForm
                index={index}
                breakName={`repetitions.${index}.targetBreak`}
                countName={`repetitions.${index}.targetCount`}
                weightName={`repetitions.${index}.targetWeight`}
                appendSlot={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void remove(index)}
                  >
                    <X />
                  </Button>
                }
              />

              <Separator className="last-of-type:hidden" />
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export { RepetitionsBlock };
