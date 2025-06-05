import type { ApiDto } from '@/shared/api/types';
import { withLazy } from '@/shared/lib/react/with-lazy';
import { AdoptedDialog } from '@/shared/ui-kit/ui/adopted-dialog';
import { Button } from '@/shared/ui-kit/ui/button';

type CreateExerciseTemplateProps = Parameters<typeof Button>[0] & {
  readonly exerciseTemplate?: ApiDto['ExerciseTemplateDto'];
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

      <AdoptedDialog
        open={open}
        onOpenChange={onOpenChange}
        slotsProps={{
          header: {
            element: exerciseTemplate == null ? 'Создание упражнения' : 'Редактирование упражнения',
          },
        }}
      >
        <ManageExerciseTemplateFormLazy exerciseTemplate={exerciseTemplate} onSuccess={onSuccess} />
      </AdoptedDialog>
    </>
  );
}

export { ManageExerciseTemplate, type CreateExerciseTemplateProps };
