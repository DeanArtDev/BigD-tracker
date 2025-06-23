import { useExerciseQuery, useExerciseUrlParams } from '@/entity/exercises';
import { withLazy } from '@/shared/lib/react/with-lazy';
import { AdoptedDialog } from '@/shared/ui-kit/ui/adopted-dialog';
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
    <AdoptedDialog
      open={open}
      onOpenChange={loading ? undefined : onOpenChange}
      slotsProps={{
        content: {
          className: `grid-rows-[auto_1fr]`,
        },
      }}
    >
      <ExercisePreviewContentLazy exercise={exercise} />
    </AdoptedDialog>
  );
}

export { ExercisePreview, type ExerciseTemplatePreviewProps };
