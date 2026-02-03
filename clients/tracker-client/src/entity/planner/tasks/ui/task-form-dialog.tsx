import type { TaskFormProps } from '@/entity/planner/tasks/ui/form';
import { useFormStateEmitter } from '@/shared/components/form';
import { withLazy } from '@/shared/lib/react/with-lazy';
import { useConfirmDialog } from '@/shared/ui-kit/helpers';
import { AppDialog, AppDialogTrigger } from '@/shared/ui-kit/ui/app-dialog';
import { type ReactNode } from 'react';

const TaskFormLazy = withLazy(() =>
  import('./form/task-form').then((m) => ({ default: m.TaskForm })),
);

interface TaskFormDialogProps {
  readonly open: boolean;
  readonly loading?: boolean;
  readonly task?: TaskFormProps['task'];
  readonly trigger?: ReactNode;
  readonly footerSlot?: TaskFormProps['footerSlot'];
  readonly footerSidebarSlot?: TaskFormProps['footerSidebarSlot'];
  readonly onOpenChange: (open: boolean) => void;
  readonly onSubmit: Required<TaskFormProps>['onSubmit'];
}

function TaskFormDialog({
  open,
  task,
  loading,
  trigger,
  footerSlot,
  footerSidebarSlot,
  onSubmit,
  onOpenChange,
}: TaskFormDialogProps) {
  const { formEmitterState, formStateEmitterProps } = useFormStateEmitter();
  const { confirmHolder, viaConfirmation } = useConfirmDialog();

  return (
    <>
      <AppDialog
        modal={false}
        open={open}
        trigger={trigger}
        onOpenChange={(value) => {
          if (formEmitterState.isLoading) return;

          viaConfirmation({
            isNeedConfirm: () => formEmitterState.isDirty && !value,
            callback: () => void onOpenChange(value),
            dialog: { title: 'Закрыть?', content: 'Не сохраненные данные будут потеряны!' },
          });
        }}
      >
        <TaskFormLazy
          task={task}
          isLoading={loading}
          {...formStateEmitterProps}
          afterNameSlot={<AppDialogTrigger />}
          footerSlot={footerSlot}
          footerSidebarSlot={footerSidebarSlot}
          onSubmit={onSubmit}
        />
      </AppDialog>

      {confirmHolder}
    </>
  );
}

export { TaskFormDialog, type TaskFormDialogProps };
