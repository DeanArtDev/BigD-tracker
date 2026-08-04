import { Event, ICalendarApp } from '@dayflow/core';
import { useCallback } from 'react';
import { useTaskUpdate } from '@/feature/planner/task-update';
import { DiaryDialogActions } from '../diary-dialog-actions';

interface UseUpdateEventParams {
  readonly getApp: () => ICalendarApp | undefined;
}

function useEventUpdate({ getApp }: UseUpdateEventParams) {
  const { updateTask } = useTaskUpdate();

  return useCallback(
    async (updatedEvent: Event, originEvent: Event) => {
      const app = getApp();
      if (app == null) return;

      const diaryEvent = DiaryDialogActions.withTaskMeta(updatedEvent);
      const task = DiaryDialogActions.mapEventToTask(diaryEvent);

      if (task.id == null) return;

      try {
        await updateTask({
          variables: {
            input: {
              id: task.id,
              name: task.name,
              description: task.description,
              deadline: task.deadline,
              startDate: task.startDate,
              priority: task.priority,
            },
          },
        });
      } catch {
        app.applyEventsChanges(
          {
            update: [{ id: originEvent.id, updates: originEvent }],
          },
          false,
          'remote',
        );
      }
    },
    [getApp, updateTask],
  );
}

export { useEventUpdate };
