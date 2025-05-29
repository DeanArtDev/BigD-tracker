import type { ApiDto } from '@/shared/api/types';
import { withLazy } from '@/shared/lib/react/with-lazy';
import { AdoptedDialog } from '@/shared/ui-kit/ui/adopted-dialog';

const TrainingManageFormLazy = withLazy(() =>
  import('./training-manage-form').then((m) => ({
    default: m.TrainingManageForm,
  })),
);

interface TrainingCreateDialogProps {
  readonly training?: ApiDto['TrainingDto'];
  readonly open: boolean;
  readonly onOpenChange: (value: boolean) => void;
  readonly onSuccess: () => void;
}

function TrainingManageDialog({
  open,
  training,
  onSuccess,
  onOpenChange,
}: TrainingCreateDialogProps) {
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
      <TrainingManageFormLazy training={training} onSuccess={onSuccess} />
    </AdoptedDialog>
  );
}

export { TrainingManageDialog, type TrainingCreateDialogProps };
