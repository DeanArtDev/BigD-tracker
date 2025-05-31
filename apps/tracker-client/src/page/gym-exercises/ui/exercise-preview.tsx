import { useExerciseTemplatesQuery } from '@/entity/exercises';
import { useExerciseTemplatesRequest } from '@/page/gym-exercises/model/use-exercise-templates-request';
import type { ApiDto } from '@/shared/api/types';
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
  readonly onDelete: () => void;
  readonly onEdit: (exercise: ApiDto['ExerciseTemplateDto']) => void;
}

function ExercisePreview({
  open,
  exerciseId,
  loading,

  onEdit,
  onDelete,
  onOpenChange,
}: ExerciseTemplatePreviewProps) {
  const { isMy } = useExerciseTemplatesRequest();
  const { data } = useExerciseTemplatesQuery({ my: isMy });
  const exercise = useMemo(() => {
    return data?.find((x) => x.id === exerciseId);
  }, [exerciseId, data]);

  return (
    <AdoptedDialog
      open={open}
      onOpenChange={loading ? undefined : onOpenChange}
      slotsProps={{
        content: {
          className: `grid-rows-[auto_1fr] max-h-[100vh] md:max-h-[80vh] 
          max-w-auto md:max-w-[900px] p-2 md:pb-4 md:pb-10 lg:p-6`,
        },
      }}
    >
      <ExercisePreviewContentLazy
        loading={loading}
        exercise={exercise}
        onEdit={() => {
          if (exercise == null) return;
          onEdit(exercise);
        }}
        onDelete={() => {
          if (exercise == null) return;
          onDelete();
        }}
      />
    </AdoptedDialog>
  );
}

export { ExercisePreview, type ExerciseTemplatePreviewProps };
