import type { ApiSchemas } from '@/shared/api/types';
import { withLazy } from '@/shared/lib/react/with-lazy';
import { AppDialog } from '@/shared/ui-kit/ui/app-dialog';
import { Button } from '@/shared/ui-kit/ui/button';

type CreateExerciseTemplateProps = Parameters<typeof Button>[0] & {
  readonly exerciseTemplate?: ApiSchemas['ExerciseWithRepetitionsDto'];
  readonly open: boolean;
  readonly onOpenChange: (value: boolean) => void;
  readonly onSuccess?: () => void;
};

const ManageExerciseTemplateFormLazy = withLazy(() =>
  import('./manage-exercise-template-form/manage-exercise-template-form').then((m) => ({
    default: m.ManageExerciseTemplateForm,
  })),
);

function ManageExerciseTemplate({
  exerciseTemplate,
  open,
  onOpenChange,
  onSuccess,
  ...buttonProps
}: CreateExerciseTemplateProps) {
  return (
    <>
      <Button
        {...buttonProps}
        onClick={(evt) => {
          onOpenChange(true);
          buttonProps.onClick?.(evt);
        }}
      />

      <AppDialog
        open={open}
        title={exerciseTemplate == null ? 'Создание упражнения' : 'Редактирование упражнения'}
        className="overflow-x-scroll sm:min-w-[650px]"
        onOpenChange={onOpenChange}
      >
        <ManageExerciseTemplateFormLazy exerciseTemplate={exerciseTemplate} onSuccess={onSuccess} />
      </AppDialog>
    </>
  );
}

export { ManageExerciseTemplate, type CreateExerciseTemplateProps };
