import type { ApiDto } from '@/shared/api/types';
import { withLazy } from '@/shared/lib/react/with-lazy';
import { AdoptedDialog } from '@/shared/ui-kit/ui/adopted-dialog';

const TrainingTemplateManageFormLazy = withLazy(() =>
  import('./training-template-manage-form').then((m) => ({
    default: m.TrainingTemplateManageForm,
  })),
);

interface TrainingTemplateCreateDialogProps {
  readonly training?: ApiDto['TrainingTemplateDto'];
  readonly open: boolean;
  readonly onOpenChange: (value: boolean) => void;
  readonly onSuccess: () => void;
}

function TrainingTemplateManageDialog({
  open,
  training,
  onSuccess,
  onOpenChange,
}: TrainingTemplateCreateDialogProps) {
  return (
    <AdoptedDialog
      open={open}
      onOpenChange={onOpenChange}
      slotsProps={{
        header: {
          element: training == null ? 'Создание тренировки' : 'Редактирование тренировки',
        },
        content: { className: 'max-w-auto md:max-w-[900px] pb-4 md:pb-10' },
      }}
    >
      <TrainingTemplateManageFormLazy training={training} onSuccess={onSuccess} />
    </AdoptedDialog>
  );
}

export { TrainingTemplateManageDialog, type TrainingTemplateCreateDialogProps };
