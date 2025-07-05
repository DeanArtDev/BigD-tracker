import { useTrainingByIdQuery } from '@/entity/trainings';
import { AdoptedDialog } from '@/shared/ui-kit/ui/adopted-dialog';
import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { Badge } from '@/shared/ui-kit/ui/badge';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { DialogHeader, DialogTitle } from '@/shared/ui-kit/ui/dialog';
import type { ReactNode } from 'react';
import { ExerciseItemPreview } from './exercise-item-preview';

interface TrainingPreviewProps {
  readonly trainingId?: number;
  readonly appendContentSlot?: ReactNode;
  readonly onOpenChange?: (value: boolean) => void;
}

function TrainingPreview({ trainingId, appendContentSlot, onOpenChange }: TrainingPreviewProps) {
  const { data: training, isLoading } = useTrainingByIdQuery({ id: trainingId });

  return (
    <AdoptedDialog
      open={trainingId != null}
      slotsProps={{
        content: {
          className: 'overflow-x-scroll',
        },
      }}
      onOpenChange={onOpenChange}
    >
      <DataLoader loadingElement={<AppLoader />} parallelMount isLoading={isLoading}>
        <div className="flex flex-col grow w-full gap-2 md:gap-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>{training?.name}</span>

              <Badge variant="secondary" className="ml-auto h-min">
                {training?.type}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="text-xs flex gap-4">
            {training?.wormUpDuration && (
              <span>{`Разминка: ${training?.wormUpDuration} мин.`}</span>
            )}

            {training?.postTrainingDuration && (
              <span>{`Заминка: ${training?.postTrainingDuration} мин.`}</span>
            )}
          </div>

          {training?.description && (
            <div>
              <h4 className="mb-1 text-md font-semibold">Описание</h4>
              <p className="whitespace-pre-line text-sm leading-5">{training?.description}</p>
            </div>
          )}

          <ul className="flex flex-col w-full gap-3">
            {training?.exercises.map((exercise, index) => {
              return (
                <ExerciseItemPreview
                  key={exercise.id}
                  index={index + 1}
                  type={exercise.type}
                  name={exercise.name}
                  repetitions={exercise.repetitions}
                />
              );
            })}
          </ul>
        </div>

        {appendContentSlot}
      </DataLoader>
    </AdoptedDialog>
  );
}

export { TrainingPreview, type TrainingPreviewProps };
