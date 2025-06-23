import { mapExerciseType } from '@/entity/exercises/lib/constants';
import { RepetitionItemPreview } from '@/entity/trainings';
import type { ApiDto } from '@/shared/api/types';
import { YoutubeViewFrame } from '@/shared/components/youtube-view-frame';
import { useYoutubeUrlParse } from '@/shared/lib/react/use-youtube-url-parse';
import { Badge } from '@/shared/ui-kit/ui/badge';
import { DialogHeader, DialogTitle } from '@/shared/ui-kit/ui/dialog';
import { Separator } from '@/shared/ui-kit/ui/separator';
import { Fragment } from 'react';

interface ExercisePreviewContentProps {
  readonly exercise?: ApiDto['ExerciseWithRepetitionsDto'] | null;
}

function ExercisePreviewContent({ exercise }: ExercisePreviewContentProps) {
  const { token } = useYoutubeUrlParse(exercise?.exampleUrl);

  return (
    <div className="flex flex-col grow w-full gap-4 overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <span className="mr-5">{exercise?.name}</span>

          {exercise && (
            <Badge variant="secondary" className="ml-auto h-min">
              {mapExerciseType[exercise?.type]}
            </Badge>
          )}
        </DialogTitle>
      </DialogHeader>

      <div className="flex flex-col grow gap-4">
        {token && <YoutubeViewFrame token={token} />}

        <div>
          <h4 className="mb-1 text-md font-semibold">Описание</h4>
          <p className="whitespace-pre-line text-sm leading-5">{exercise?.description}</p>
        </div>

        <Separator />

        <h4 className="mb-1 text-md font-semibold">Подходы</h4>
        <ul className="space-y-2">
          {exercise?.repetitions.map((rep, index) => {
            return (
              <Fragment key={rep.id}>
                <RepetitionItemPreview
                  index={index}
                  count={rep.targetCount}
                  weight={rep.targetWeight}
                  breakDuration={rep.targetBreak}
                />

                <Separator className="last-of-type:hidden" />
              </Fragment>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export { ExercisePreviewContent, type ExercisePreviewContentProps };
