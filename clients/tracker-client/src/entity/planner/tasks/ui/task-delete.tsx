import { AlertConfirmDialog } from '@/shared/components/alert-confirm-dialog';
import type { ReactNode } from 'react';
import { useDeleteTask } from '../model';

interface TaskDeleteProps {
  readonly children: (props: { isLoading: boolean }) => ReactNode;
  readonly taskId: number;
  readonly onSuccess?: () => void;
}

function TaskDelete({ taskId, onSuccess, children }: TaskDeleteProps) {
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

export { TaskDelete, type TaskDeleteProps };
