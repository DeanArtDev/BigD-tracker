import { ExerciseSearch } from '@/entity/exercises/ui/exercise-search';
import { Button } from '@/shared/ui-kit/ui/button';
import { ExerciseElements } from './exercise-elements';
import { DndVerticalContainer } from '@/shared/components/dnd-vertical-container';
import { Frown, GripVertical } from 'lucide-react';
import { type FieldArrayPath, useFieldArray } from 'react-hook-form';
import type { TrainingManageFormData } from '../training-template-manage-form';

function ExerciseAddingBlock() {
  const { fields, prepend, remove, move } = useFieldArray<
    { exerciseList: TrainingManageFormData['exerciseList'] },
    FieldArrayPath<{ exerciseList: TrainingManageFormData['exerciseList'] }>,
    'formUid'
  >({ name: 'exerciseList', keyName: 'formUid' });

  return (
    <div className="flex flex-col gap-4">
      <ExerciseSearch
        modal
        onSelect={(exercise) => {
          const inx = fields.findIndex((field) => field.id === exercise.id);
          if (inx === -1) {
            prepend({ id: exercise.id, name: exercise.name, sets: 3, repetitions: 12 });
          }
        }}
      />

      {fields.length <= 0 && (
        <div className="text-sm flex items-center justify-center gap-2 pt-5">
          <Frown className="text-orange-300" /> Нет упражнений для данной тренировки
        </div>
      )}

      <div className="flex flex-col gap-2">
        <DndVerticalContainer
          items={fields}
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
              <div ref={setNodeRef} style={{ transform: cssTransform, transition: cssTransition }}>
                <ExerciseElements
                  index={index}
                  id={exercise.id}
                  key={exercise.id}
                  name={exercise.name}
                  beforeStartSlot={
                    <Button
                      className="!p-2 cursor-grab"
                      size="sm"
                      type="button"
                      disabled={fields.length === 1}
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
