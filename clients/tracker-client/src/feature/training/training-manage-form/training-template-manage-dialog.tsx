import { withLazy } from '@/shared/lib/react/with-lazy';
import { AppDialog } from '@/shared/ui-kit/ui/app-dialog';

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
    <AppDialog
      open={open}
      title={templateId == null ? 'Создание тренировки' : 'Редактирование тренировки'}
      onOpenChange={onOpenChange}
      className="overflow-x-scroll"
    >
      <div className="p-2.5 sm:p-4">
        <TrainingTemplateManageFormLazy templateId={templateId} onSuccess={onSuccess} />
      </div>
    </AppDialog>
  );
}

export { TrainingTemplateManageDialog, type TrainingTemplateCreateDialogProps };
