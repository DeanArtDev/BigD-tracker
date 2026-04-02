import { useTaskFinish } from '@/entity/planner/tasks';
import { useFormStateEmitter } from '@/shared/components/form';
import { useConfirmDialog } from '@/shared/ui-kit/helpers';
import { AppDialog } from '@/shared/ui-kit/ui/app-dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import { TaskFinishForm } from './task-finish-form';

function useFinishDialogForm() {
  const { formEmitterState, formStateEmitterProps } = useFormStateEmitter();
  const { confirmHolder, viaConfirmation } = useConfirmDialog();

  const [open, setOpen] = useState(false);
  const [openFormProps, setOpenFormProps] = useState<{ taskId: string; onSuccess: () => Promise<void> } | null>(null);

  const { finishTask, isPending: isTaskFinishPending } = useTaskFinish();

  const finishDialogHolder = (
    <>
      <AppDialog
        open={open}
        className="h-full max-h-[60vh] sm:max-h-[450px] w-[90vw] sm:w-[450px]"
        onOpenChange={(value) => {
          if (formEmitterState.isLoading) return;

          viaConfirmation({
            isNeedConfirm: () => formEmitterState.isDirty && !value,
            callback: () => void setOpen(value),
            dialog: { title: 'Закрыть?', content: 'Не сохраненные данные будут потеряны!' },
          });
        }}
      >
        <div className="flex grow p-3">
          <TaskFinishForm
            {...formStateEmitterProps}
            onSubmit={(formData) => {
              if (openFormProps == null || isTaskFinishPending) return;

              finishTask(
                { params: { path: { taskId: openFormProps.taskId } }, body: { data: formData } },
                {
                  onSuccess: async () => {
                    await openFormProps.onSuccess();
                    toast.success('Дело завершено!');
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

  return {
    finishDialogHolder,
    isTaskFinishPending,

    openTaskFinishForm: (params: { taskId: string; onSuccess: () => Promise<void> }) => {
      setOpenFormProps(params);
      setOpen(true);
    },
  };
}

export { useFinishDialogForm };
