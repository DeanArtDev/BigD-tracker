import { useFormStateEmitter } from '@/shared/components/form';
import { withLazy } from '@/shared/lib/react/with-lazy';
import { useConfirmDialog } from '@/shared/ui-kit/helpers';
import { AppDialog } from '@/shared/ui-kit/ui/app-dialog';
import { Button } from '@/shared/ui-kit/ui/button';
import { cn } from '@/shared/ui-kit/utils';
import { Plus } from 'lucide-react';
import { useState } from 'react';

const ThingManagerFormLazy = withLazy(() =>
  import('@/feature/planner/thing-manager').then((m) => ({ default: m.ThingManagerForm })),
);

function AddThing() {
  const [openThingManager, setOpenThingManager] = useState(false);
  const { formEmitterState, formStateEmitterProps } = useFormStateEmitter();
  const { confirmHolder, viaConfirmation } = useConfirmDialog();

  return (
    <>
      <AppDialog
        open={openThingManager}
        title="Создать дело"
        trigger={
          <Button
            size="icon"
            className={cn('absolute bottom-5 sm:bottom-7 right-5 sm:right-5 rounded-full p-6', {
              'sm:-right-15': openThingManager,
            })}
          >
            <Plus className="size-6" />
          </Button>
        }
        onOpenChange={(value) => {
          if (formEmitterState.isLoading) return;

          viaConfirmation({
            isNeedConfirm: () => formEmitterState.isDirty && !value,
            callback: () => void setOpenThingManager(value),
            dialog: { title: 'Не сохраненные данные будут потеряны! Закрыть?' },
          });
        }}
      >
        <div className="flex flex-col p-2.5 sm:p-4">
          <ThingManagerFormLazy
            isLoading={false}
            {...formStateEmitterProps}
            onSubmit={(formResult) => {
              // void setOpenThingManager(false)
              console.log(formResult);
            }}
          />
        </div>
      </AppDialog>

      {confirmHolder}
    </>
  );
}

export { AddThing };
