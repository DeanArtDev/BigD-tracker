import { Event, ICalendarApp } from '@dayflow/core';
import { useCallback } from 'react';
import { useTaskSettingsUpdate } from '@/feature/planner/task-settings-update';
import { useTaskUpdate } from '@/feature/planner/task-update';
import { DiaryEventDomain } from '../diary-event-domain';

interface UseUpdateEventParams {
  readonly getApp: () => ICalendarApp | undefined;
}

function useEventUpdate({ getApp }: UseUpdateEventParams) {
  const { updateTask } = useTaskUpdate();
  const { updateTaskSettings } = useTaskSettingsUpdate();

  return useCallback(
    async (updatedEvent: Event, originEvent: Event) => {
      const app = getApp();
      if (app == null) return;

      const diaryEvent = DiaryEventDomain.withTaskMeta(updatedEvent);
      const task = DiaryEventDomain.mapEventToTask(diaryEvent);

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

        if (originEvent.allDay !== updatedEvent.allDay) {
          await updateTaskSettings({
            variables: { input: { isAllDay: updatedEvent.allDay, taskId: task.id } },
          });
        }
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
    [getApp, updateTask, updateTaskSettings],
  );
}

export { useEventUpdate };
