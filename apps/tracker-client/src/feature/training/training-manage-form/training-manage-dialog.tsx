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
        content: { className: 'sm:max-w-[900px] pb-10 md:pb-6' },
      }}
    >
      <TrainingManageFormLazy training={training} onSuccess={onSuccess} />
    </AdoptedDialog>
  );
}

export { TrainingManageDialog, type TrainingCreateDialogProps };
