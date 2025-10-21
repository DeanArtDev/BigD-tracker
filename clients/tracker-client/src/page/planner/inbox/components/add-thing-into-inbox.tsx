import { useInvalidateInbox } from '@/entity/planner/groups';
import { useCreateThingIntoInbox } from '@/entity/planner/things';
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

function AddThingIntoInbox() {
  const [openThingManager, setOpenThingManager] = useState(false);
  const { formEmitterState, formStateEmitterProps } = useFormStateEmitter();
  const { confirmHolder, viaConfirmation } = useConfirmDialog();

  const { createThing, isPending: isCreatePending } = useCreateThingIntoInbox();
  const invalidateInbox = useInvalidateInbox();

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
        <div className="flex flex-col p-2.5 sm:p-4 grow md:grow-0">
          <ThingManagerFormLazy
            {...formStateEmitterProps}
            isLoading={isCreatePending}
            onSubmit={(formResult) => {
              createThing(
                { body: { data: formResult } },
                {
                  onSuccess: async () => {
                    await invalidateInbox();
                    setOpenThingManager(false);
                  },
                },
              );
            }}
          />
        </div>
      </AppDialog>

      {confirmHolder}
    </>
  );
}

export { AddThingIntoInbox };
