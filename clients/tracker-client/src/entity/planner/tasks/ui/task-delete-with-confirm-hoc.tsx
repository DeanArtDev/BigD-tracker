import { AlertConfirmDialog } from '@/shared/components/alert-confirm-dialog';
import type { ReactNode } from 'react';
import { useDeleteTask } from '../model';

interface TaskDeleteWithConfirmHocProps {
  readonly children: (props: { isLoading: boolean }) => ReactNode;
  readonly taskId: number;
  readonly onSuccess?: () => Promise<void> | void;
}

function TaskDeleteWithConfirmHoc({ taskId, onSuccess, children }: TaskDeleteWithConfirmHocProps) {
  const { deleteTask, isPending } = useDeleteTask();

  return (
    <AlertConfirmDialog
      title="Удалить?"
      content="В будущем, дело можно будет восстановить"
      onConfirm={() => void deleteTask({ params: { path: { taskId } } }, { onSuccess })}
    >
      {children({ isLoading: isPending })}
    </AlertConfirmDialog>
  );
}

export { TaskDeleteWithConfirmHoc, type TaskDeleteWithConfirmHocProps };
