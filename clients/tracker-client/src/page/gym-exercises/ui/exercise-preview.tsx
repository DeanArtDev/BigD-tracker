import { useExerciseQuery, useExerciseUrlParams } from '@/entity/exercises';
import { mapExerciseType } from '@/entity/exercises/lib/constants';
import { withLazy } from '@/shared/lib/react/with-lazy';
import { AppDialog } from '@/shared/ui-kit/ui/app-dialog';
import { Badge } from '@/shared/ui-kit/ui/badge';
import { useMemo } from 'react';

const ExercisePreviewContentLazy = withLazy(() =>
  import('./exercise-preview-content').then((m) => ({
    default: m.ExercisePreviewContent,
  })),
);

interface ExerciseTemplatePreviewProps {
  readonly exerciseId?: number;
  readonly open: boolean;
  readonly loading: boolean;
  readonly onOpenChange: (value: boolean) => void;
}

function ExercisePreview({
  open,
  exerciseId,
  loading,

  onOpenChange,
}: ExerciseTemplatePreviewProps) {
  const { isMy } = useExerciseUrlParams();
  const { data } = useExerciseQuery({ my: isMy });
  const exercise = useMemo(() => {
    return data?.find((x) => x.id === exerciseId);
  }, [exerciseId, data]);

  return (
    <AppDialog
      open={open}
      title={exercise?.name}
      description={
        exercise && (
          <Badge variant="secondary" className="ml-auto h-min">
            {mapExerciseType[exercise?.type]}
          </Badge>
        )
      }
      onOpenChange={loading ? undefined : onOpenChange}
    >
      <ExercisePreviewContentLazy exercise={exercise} />
    </AppDialog>
  );
}

export { ExercisePreview, type ExerciseTemplatePreviewProps };
