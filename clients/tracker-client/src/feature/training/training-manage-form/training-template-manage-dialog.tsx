import { withLazy } from '@/shared/lib/react/with-lazy';
import { AdoptedDialog } from '@/shared/ui-kit/ui/adopted-dialog';

const TrainingTemplateManageFormLazy = withLazy(() =>
  import('./training-template-manage-form').then((m) => ({
    default: m.TrainingTemplateManageForm,
  })),
);

interface TrainingTemplateCreateDialogProps {
  readonly templateId?: number;
  readonly open: boolean;
  readonly onOpenChange: (value: boolean) => void;
  readonly onSuccess: () => void;
}

function TrainingTemplateManageDialog({
  open,
  templateId,
  onSuccess,
  onOpenChange,
}: TrainingTemplateCreateDialogProps) {
  return (
    <AdoptedDialog
      open={open}
      onOpenChange={onOpenChange}
      slotsProps={{
        header: {
          element: templateId == null ? 'Создание тренировки' : 'Редактирование тренировки',
        },
        content: {
          className: 'overflow-x-scroll',
        },
      }}
    >
      <TrainingTemplateManageFormLazy templateId={templateId} onSuccess={onSuccess} />
    </AdoptedDialog>
  );
}

export { TrainingTemplateManageDialog, type TrainingTemplateCreateDialogProps };
