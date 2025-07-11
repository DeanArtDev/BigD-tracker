import { ExerciseSearch } from '@/entity/exercises/ui/exercise-search';
import { DndVerticalContainer } from '@/shared/components/dnd-vertical-container';
import { ErrorMessageForm } from '@/shared/components/form';
import { Alert, AlertDescription } from '@/shared/ui-kit/ui/alert';
import { Button } from '@/shared/ui-kit/ui/button';
import { AlertCircleIcon, Frown, GripVertical } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import type { TrainingManageFormData } from '../training-template-manage-form';
import { ExerciseElements } from './exercise-elements';

function ExerciseAddingBlock() {
  const methods = useFormContext<TrainingManageFormData>();
  const { fields, append, remove, move } = useFieldArray({
    name: 'exercises',
    keyName: 'formUid',
    control: methods.control,
  });

  return (
    <div className="flex flex-col gap-4">
      <ExerciseSearch
        modal
        onSelect={(exercise) => {
          append({
            id: exercise.id,
            name: exercise.name,
            type: exercise.type,
            description: exercise.description,
            exampleUrl: exercise.exampleUrl,
            repetitions: exercise.repetitions.map((rep) => ({
              id: rep.id,
              targetCount: rep.targetCount,
              targetBreak: rep.targetBreak,
              targetWeight: +rep.targetWeight,
            })),
          });
        }}
      />

      <ErrorMessageForm
        name="exercises"
        renderContent={({ message }) => {
          return (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          );
        }}
      />

      {fields.length <= 0 && (
        <div className="text-sm flex items-center justify-center gap-2 pt-5">
          <Frown className="text-orange-300" /> Нет упражнений для данной тренировки
        </div>
      )}

      <div className="flex flex-col gap-2 md:gap-4">
        <DndVerticalContainer
          items={fields.map((i) => ({ moveId: i.formUid, ...i }))}
          onElementsSort={({ oldIndex, newIndex }) => void move(oldIndex, newIndex)}
          itemRender={({
            index,
            item: exercise,
            attributes,
            listeners,
            cssTransform,
            cssTransition,
            setNodeRef,
          }) => {
            return (
              <div
                key={exercise.moveId}
                ref={setNodeRef}
                style={{ transform: cssTransform, transition: cssTransition }}
              >
                <ExerciseElements
                  index={index}
                  name={exercise.name}
                  disabled={methods.formState.disabled}
                  beforeStartSlot={
                    <Button
                      className="!p-2 cursor-grab"
                      size="sm"
                      type="button"
                      disabled={fields.length === 1 || methods.formState.disabled}
                      variant="ghost"
                      {...listeners}
                      {...attributes}
                    >
                      <GripVertical className="opacity-50" />
                    </Button>
                  }
                  onRemove={remove}
                />
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}

export { ExerciseAddingBlock };
