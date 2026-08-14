import { useApolloClient } from '@apollo/client/react';
import { Event, ICalendarApp } from '@dayflow/core';
import { useCallback } from 'react';
import { TaskUtils } from '@/entity/planner/tasks';
import { useTaskSettingsUpdate } from '@/feature/planner/task-settings-update';
import { useTaskUpdate } from '@/feature/planner/task-update';
import { TaskCacheManager } from '@/shared/transport/graphql';
import { DiaryEventDomain } from '../diary-event-domain';

interface UseUpdateEventParams {
  readonly getApp: () => ICalendarApp | undefined;
}

function useEventUpdate({ getApp }: UseUpdateEventParams) {
  const client = useApolloClient();
  const { updateTask, loading } = useTaskUpdate();
  const { updateTaskSettings } = useTaskSettingsUpdate();

  return {
    loading,
    persistEventUpdate: useCallback(
      async (
        afterEvent: Event,
        beforeEvent: Event,
        options: { loading?: boolean } = { loading: false },
      ): Promise<boolean> => {
        const app = getApp();
        if (app == null) return false;

        const { loading } = options;

        const taskToUpdate = DiaryEventDomain.mapEventToTask(DiaryEventDomain.withTaskMeta(afterEvent));
        if (taskToUpdate.id == null) return false;

        try {
          if (loading) {
            const evt = DiaryEventDomain.withTaskMeta(afterEvent, { loading: true });
            app.applyEventsChanges({ update: [{ id: evt.id, updates: evt }] }, false, 'remote');
          }

          const result = await updateTask({
            variables: {
              input: {
                id: taskToUpdate.id,
                name: taskToUpdate.name,
                description: taskToUpdate.description,
                deadline: taskToUpdate.deadline,
                startDate: taskToUpdate.startDate,
                priority: taskToUpdate.priority,
                recurrence: TaskUtils.getSafetyRecurrenceInput(taskToUpdate.recurrence),
              },
            },
          });
          if (result.data?.updateTask == null) {
            await Promise.reject();
            return false;
          }

          if (afterEvent.allDay !== beforeEvent.allDay) {
            const taskSettingsResult = await updateTaskSettings({
              variables: { input: { isAllDay: afterEvent.allDay, taskId: taskToUpdate.id } },
            });
            if (taskSettingsResult.data?.updateTaskSettings == null) {
              await Promise.reject();
              return false;
            }
          }

          const beforeEvt = DiaryEventDomain.withTaskMeta(beforeEvent);
          const isBecameRecurrent = taskToUpdate.recurrence != null && beforeEvt.meta.recurrence == null;
          if (isBecameRecurrent) {
            await TaskCacheManager.refetchGetDiaryTasks(client);
            app.applyEventsChanges({ delete: [afterEvent.id] }, false, 'remote');
            return true;
          }

          if (DiaryEventDomain.isDiaryTask(result.data.updateTask)) {
            const newEvent = DiaryEventDomain.mapTaskToEvent(
              result.data.updateTask,
              loading ? { loading: false } : undefined,
            );

            app.applyEventsChanges({ delete: [afterEvent.id], add: [newEvent] }, false, 'remote');
            return true;
          }
          return false;
        } catch {
          const evt = DiaryEventDomain.withTaskMeta(beforeEvent, loading ? { loading: false } : undefined);
          app.applyEventsChanges({ update: [{ id: evt.id, updates: evt }] }, false, 'remote');
          return false;
        }
      },
      [client, getApp, updateTask, updateTaskSettings],
    ),
  };
}

export { useEventUpdate };
