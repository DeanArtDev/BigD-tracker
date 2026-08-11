import { Event, ICalendarApp } from '@dayflow/core';
import { useCallback } from 'react';
import { TaskUtils } from '@/entity/planner/tasks';
import { useTaskSettingsUpdate } from '@/feature/planner/task-settings-update';
import { useTaskUpdate } from '@/feature/planner/task-update';
import { DiaryEventDomain } from '../diary-event-domain';

interface UseUpdateEventParams {
  readonly getApp: () => ICalendarApp | undefined;
}

function useEventUpdate({ getApp }: UseUpdateEventParams) {
  const { updateTask, loading } = useTaskUpdate();
  const { updateTaskSettings } = useTaskSettingsUpdate();

  return {
    loading,
    persistEventUpdate: useCallback(
      async (updatedEvent: Event, originEvent: Event) => {
        const app = getApp();
        if (app == null) return;

        const diaryEvent = DiaryEventDomain.withTaskMeta(updatedEvent);
        const task = DiaryEventDomain.mapEventToTask(diaryEvent);

        if (task.id == null) return;

        try {
          const result = await updateTask({
            variables: {
              input: {
                id: task.id,
                name: task.name,
                description: task.description,
                deadline: task.deadline,
                startDate: task.startDate,
                priority: task.priority,
                recurrence: TaskUtils.getSafetyRecurrenceInput(task.recurrence),
              },
            },
          });

          if (originEvent.allDay !== updatedEvent.allDay) {
            await updateTaskSettings({ variables: { input: { isAllDay: updatedEvent.allDay, taskId: task.id } } });
          }

          return result.data?.updateTask != null;
        } catch {
          app.applyEventsChanges({ update: [{ id: originEvent.id, updates: originEvent }] }, false, 'remote');
          return false;
        }
      },
      [getApp, updateTask, updateTaskSettings],
    ),
  };
}

export { useEventUpdate };
