import type { ThingManagerFormReturn, ThingManagerSubmitData } from '@/entity/planner/things/ui';
import { useFormStateEmitter } from '@/shared/components/form';
import { withLazy } from '@/shared/lib/react/with-lazy';
import { useConfirmDialog } from '@/shared/ui-kit/helpers';
import { AppDialog } from '@/shared/ui-kit/ui/app-dialog';
import { Button } from '@/shared/ui-kit/ui/button';
import { cn } from '@/shared/ui-kit/utils';
import { Plus } from 'lucide-react';
import { type ReactNode, useState } from 'react';

const ThingManagerFormLazy = withLazy(() =>
  import('@/entity/planner/things/ui').then((m) => ({ default: m.ThingManagerForm })),
);

interface AddThingDialogProps {
  readonly loading?: boolean;
  readonly dateSlot?: ReactNode | ((form: ThingManagerFormReturn) => ReactNode);
  readonly onSubmit: (formData: ThingManagerSubmitData, { close }: { close: () => void }) => void;
}

function AddThingDialog({ loading, dateSlot, onSubmit }: AddThingDialogProps) {
  const [open, setOpen] = useState(false);
  const { formEmitterState, formStateEmitterProps } = useFormStateEmitter();
  const { confirmHolder, viaConfirmation } = useConfirmDialog();

  return (
    <>
      <AppDialog
        open={open}
        title="Создать дело"
        trigger={
          <Button
            size="icon"
            className={cn('absolute bottom-5 sm:bottom-7 right-5 sm:right-5 rounded-full p-6 z-[49]', {
              'sm:-right-15': open,
            })}
          >
            <Plus className="size-6" />
          </Button>
        }
        onOpenChange={(value) => {
          if (formEmitterState.isLoading) return;

          viaConfirmation({
            isNeedConfirm: () => formEmitterState.isDirty && !value,
            callback: () => void setOpen(value),
            dialog: { title: 'Не сохраненные данные будут потеряны! Закрыть?' },
          });
        }}
      >
        <div className="flex flex-col p-2.5 sm:p-4">
          <ThingManagerFormLazy
            isLoading={loading}
            dateSlot={dateSlot}
            {...formStateEmitterProps}
            onSubmit={(formData) => void onSubmit(formData, { close: () => setOpen(false) })}
          />
        </div>
      </AppDialog>

      {confirmHolder}
    </>
  );
}

export { AddThingDialog };
