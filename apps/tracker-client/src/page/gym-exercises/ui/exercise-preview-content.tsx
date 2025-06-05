import { useMeSuspense } from '@/entity/auth';
import { mapExerciseType } from '@/entity/exercises/lib/constants';
import { ExerciseConfirmDelete } from '@/entity/exercises/ui/exercise-confirm-delete';
import { ExerciseEditTooltip } from '@/entity/exercises/ui/exercise-edit-tooltip';
import type { ApiDto } from '@/shared/api/types';
import { YoutubeViewFrame } from '@/shared/components/youtube-view-frame';
import { useYoutubeUrlParse } from '@/shared/lib/react/use-youtube-url-parse';
import { Badge } from '@/shared/ui-kit/ui/badge';
import { Button } from '@/shared/ui-kit/ui/button';
import { DialogHeader, DialogTitle } from '@/shared/ui-kit/ui/dialog';
import { cn } from '@/shared/ui-kit/utils';
import { Pencil, Plus, Trash2 } from 'lucide-react';

interface ExercisePreviewContentProps {
  readonly exercise?: ApiDto['ExerciseTemplateDto'] | null;
  readonly loading: boolean;
  readonly onDelete: () => void;
  readonly onEdit: () => void;
}

function ExercisePreviewContent({
  exercise,
  loading,

  onEdit,
  onDelete,
}: ExercisePreviewContentProps) {
  const { me } = useMeSuspense();
  const { token } = useYoutubeUrlParse(exercise?.exampleUrl);
  const isMine = exercise?.userId === me.id;

  return (
    <div className="flex flex-col grow w-full gap-4">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Plus />
          </Button>
          <span className="mr-5">{exercise?.name}</span>

          {exercise && (
            <Badge variant="secondary" className="ml-auto h-min">
              {mapExerciseType[exercise?.type]}
            </Badge>
          )}
        </DialogTitle>
      </DialogHeader>

      <div className="overflow-y-auto flex flex-col grow gap-4">
        {token && <YoutubeViewFrame token={token} />}

        <div>
          <h4 className="mb-1 text-md font-semibold">Описание</h4>
          <p className="whitespace-pre-line text-sm leading-5">{exercise?.description}</p>
        </div>

        <div className="flex justify-end gap-2 mt-auto">
          <ExerciseEditTooltip on={!isMine}>
            <Button
              size="sm"
              disabled={loading}
              variant={isMine ? 'outline' : 'ghost'}
              className={cn({ 'opacity-50': !isMine })}
              onClick={onEdit}
            >
              <Pencil />
            </Button>
          </ExerciseEditTooltip>

          <ExerciseConfirmDelete on={isMine} onOk={onDelete}>
            <Button
              size="sm"
              className={cn({ 'opacity-50': !isMine })}
              disabled={loading}
              variant={isMine ? 'destructive' : 'ghost'}
            >
              <Trash2 />
            </Button>
          </ExerciseConfirmDelete>
        </div>
      </div>
    </div>
  );
}

export { ExercisePreviewContent, type ExercisePreviewContentProps };
