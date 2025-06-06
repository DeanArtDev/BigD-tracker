import type { ApiDto } from '@/shared/api/types';
import { AdoptedDialog } from '@/shared/ui-kit/ui/adopted-dialog';
import { Badge } from '@/shared/ui-kit/ui/badge';
import { DialogHeader, DialogTitle } from '@/shared/ui-kit/ui/dialog';

interface TrainingPreviewProps {
  readonly training: ApiDto['TrainingAggregationDto'] | undefined;
  readonly onOpenChange?: (value: boolean) => void;
}

function TrainingPreview({ training, onOpenChange }: TrainingPreviewProps) {
  return (
    <AdoptedDialog open={training != null} onOpenChange={onOpenChange}>
      <div className="flex flex-col grow w-full gap-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="mr-5">{training?.name}</span>

            <Badge variant="secondary" className="ml-auto h-min">
              {training?.type}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div>
          <h4 className="mb-1 text-md font-semibold">Описание</h4>
          <p className="whitespace-pre-line text-sm leading-5">{training?.description}</p>
        </div>

        <ul>
          {training?.exercises.map((exercise) => {
            return <li>{exercise.name}</li>;
          })}
        </ul>
      </div>
    </AdoptedDialog>
  );
}

export { TrainingPreview, type TrainingPreviewProps };
