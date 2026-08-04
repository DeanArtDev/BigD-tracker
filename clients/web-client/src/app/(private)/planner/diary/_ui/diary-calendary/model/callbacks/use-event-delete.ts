import { useCallback } from 'react';
import { useTaskDeleteFeature } from '@/feature/planner/task-delete';
import { useDiaryContext } from '../../context';
import { DiaryDialogActions } from '../diary-dialog-actions';

function useEventDelete() {
  const {
    calendar: { app },
  } = useDiaryContext();
  const { deleteTask } = useTaskDeleteFeature();

  return useCallback(
    (eventId: string) => {
      const event = app.getAllEvents().find(({ id }) => id === eventId);
      if (event == null) return Promise.reject(new Error(`Event with id ${eventId} not found`));

      const task = DiaryDialogActions.mapEventToTask(DiaryDialogActions.withTaskMeta(event));
      const taskId = task.id;
      if (taskId == null) return Promise.resolve();

      return new Promise<void>((resolve, reject) => {
        deleteTask(
          { taskId, groupId: task.groupId },
          {
            showToast: false,
            onCancel: () => reject(new Error('Task deletion cancelled')),
            onError: reject,
            onSuccess: resolve,
          },
        );
      });
    },
    [app, deleteTask],
  );
}

export { useEventDelete };
