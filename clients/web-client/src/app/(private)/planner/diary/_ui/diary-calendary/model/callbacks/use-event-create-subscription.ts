import { Event } from '@dayflow/core';
import { useEffect } from 'react';
import { TaskUtils } from '@/entity/planner/tasks';
import { invalidateTaskCreateCache, useTaskCreate } from '@/feature/planner/task-create';
import { useTaskSettingsUpdate } from '@/feature/planner/task-settings-update';
import { TaskCacheManager } from '@/shared/transport/graphql';
import { useDiaryContext } from '../../context';
import { DiaryEventDomain } from '../diary-event-domain';

function useEventCreateSubscription() {
  const { app } = useDiaryContext();
  const { client, createTask } = useTaskCreate();
  const { updateTaskSettings } = useTaskSettingsUpdate();

  useEffect(() => {
    const createEvent = async (event: Event) => {
      const diaryEvent = DiaryEventDomain.withTaskMeta({
        ...event,
        meta: { ...event.meta, id: undefined, loading: true },
      });

      app.applyEventsChanges({ update: [{ id: event.id, updates: { meta: diaryEvent.meta } }] }, false, 'remote');

      try {
        const task = DiaryEventDomain.mapEventToTask(diaryEvent);
        const createdTaskData = await createTask({
          variables: {
            input: {
              name: task.name,
              description: task.description,
              deadline: task.deadline,
              startDate: task.startDate,
              priority: task.priority,
              groupId: task.groupId,
              recurrence: TaskUtils.getSafetyRecurrenceInput(task.recurrence),
            },
          },
        });

        const createdTask = createdTaskData?.data?.createTask;
        if (createdTask != null) {
          if (task.recurrence != null) {
            await TaskCacheManager.refetchGetDiaryTasks(client);
            app.applyEventsChanges({ delete: [event.id] }, false, 'remote');
          } else {
            app.applyEventsChanges(
              {
                delete: [event.id],
                add: [
                  {
                    ...event,
                    id: DiaryEventDomain.createEventId(createdTask.id),
                    meta: {
                      ...diaryEvent.meta,
                      id: createdTask.id,
                      loading: false,
                    },
                  },
                ],
              },
              false,
              'remote',
            );
          }

          await invalidateTaskCreateCache(client);

          if (task.settings?.isAllDay) {
            await updateTaskSettings({
              variables: { input: { isAllDay: task.settings?.isAllDay, taskId: createdTask.id } },
            });
          }
        }
      } catch {
        app.applyEventsChanges({ delete: [event.id] }, false, 'remote');
      }
    };

    return app.subscribeEventChanges((changes) => {
      changes.forEach((change) => {
        if (change.type === 'create' && change.source !== 'remote') {
          void createEvent(change.event);
        }
      });
    });
  }, [app, client, createTask, updateTaskSettings]);
}

export { useEventCreateSubscription };
