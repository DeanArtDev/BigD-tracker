import type { TaskInboxEntity } from '@/entity/planner/tasks';
import type { ThingManagerSubmitData } from '@/entity/planner/tasks/ui';
import { useFormStateEmitter } from '@/shared/components/form';
import { withLazy } from '@/shared/lib/react/with-lazy';
import { useConfirmDialog } from '@/shared/ui-kit/helpers';
import { AppDialog, AppDialogTrigger } from '@/shared/ui-kit/ui/app-dialog';
import { Button } from '@/shared/ui-kit/ui/button';
import { cn } from '@/shared/ui-kit/utils';
import { Plus } from 'lucide-react';
import { useState } from 'react';

const TaskInboxFormLazy = withLazy(() =>
  import('@/entity/planner/tasks/ui/form').then((m) => ({ default: m.TaskInboxForm })),
);

interface AddTaskInboxDialogProps {
  readonly loading?: boolean;
  readonly inboxTask?: Omit<TaskInboxEntity, 'id'>;
  readonly onSubmit: (formData: ThingManagerSubmitData, { close }: { close: () => void }) => void;
}

function AddTaskInboxDialog({ inboxTask, loading, onSubmit }: AddTaskInboxDialogProps) {
  const [open, setOpen] = useState(false);
  const { formEmitterState, formStateEmitterProps } = useFormStateEmitter();
  const { confirmHolder, viaConfirmation } = useConfirmDialog();

  return (
    <>
      <AppDialog
        modal={false}
        open={open}
        trigger={
          <Button
            size="icon"
            className={cn(
              'absolute bottom-5 sm:bottom-7 right-5 sm:right-5 rounded-full p-6 z-49',
              { 'sm:-right-15': open },
            )}
          >
            <Plus className="size-6" />
          </Button>
        }
        onOpenChange={(value) => {
          if (formEmitterState.isLoading) return;

          viaConfirmation({
            isNeedConfirm: () => formEmitterState.isDirty && !value,
            callback: () => void setOpen(value),
            dialog: { title: 'Закрыть?', content: 'Не сохраненные данные будут потеряны!' },
          });
        }}
      >
        <TaskInboxFormLazy
          inboxTask={inboxTask}
          isLoading={loading}
          {...formStateEmitterProps}
          afterNameSlot={<AppDialogTrigger />}
          onSubmit={(formData) => void onSubmit(formData, { close: () => setOpen(false) })}
        />
      </AppDialog>

      {confirmHolder}
    </>
  );
}

export { AddTaskInboxDialog };
