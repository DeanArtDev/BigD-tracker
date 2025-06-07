import type { ReactNode } from 'react';
import { ExerciseItemPreview } from './exercise-item-preview';
import type { ApiDto } from '@/shared/api/types';
import { AdoptedDialog } from '@/shared/ui-kit/ui/adopted-dialog';
import { Badge } from '@/shared/ui-kit/ui/badge';
import { DialogHeader, DialogTitle } from '@/shared/ui-kit/ui/dialog';

interface TrainingPreviewProps {
  readonly training: ApiDto['TrainingAggregationDto'] | undefined;
  readonly appendContentSlot?: ReactNode;
  readonly onOpenChange?: (value: boolean) => void;
}

function TrainingPreview({ training, appendContentSlot, onOpenChange }: TrainingPreviewProps) {
  return (
    <AdoptedDialog open={training != null} onOpenChange={onOpenChange}>
      <div className="flex flex-col grow w-full gap-2 md:gap-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{training?.name}</span>

            <Badge variant="secondary" className="ml-auto h-min">
              {training?.type}
            </Badge>
          </DialogTitle>
        </DialogHeader>

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
                count={index + 1}
                type={exercise.type}
                name={exercise.name}
                description={exercise.description}
              />
            );
          })}
        </ul>
      </div>

      {appendContentSlot}
    </AdoptedDialog>
  );
}

export { TrainingPreview, type TrainingPreviewProps };
