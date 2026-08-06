import { Event } from '@dayflow/core';
import { useEffect } from 'react';
import { invalidateTaskCreateCache, useTaskCreate } from '@/feature/planner/task-create';
import { useTaskSettingsUpdate } from '@/feature/planner/task-settings-update';
import { useDiaryContext } from '../../context';
import { DiaryEventDomain } from '../diary-event-domain';

function useEventCreateSubscription() {
  const { calendar } = useDiaryContext();
  const { client, createTask } = useTaskCreate();
  const { updateTaskSettings } = useTaskSettingsUpdate();

  const app = calendar.app;

  useEffect(() => {
    const createEvent = async (event: Event) => {
      const diaryEvent = DiaryEventDomain.withTaskMeta(event);
      const task = DiaryEventDomain.mapEventToTask(diaryEvent);

      try {
        const createdTaskData = await createTask({
          variables: {
            input: {
              name: task.name,
              description: task.description,
              deadline: task.deadline,
              startDate: task.startDate,
              priority: task.priority,
              groupId: task.groupId,
            },
          },
        });

        const createdTask = createdTaskData?.data?.createTask;
        if (createdTask != null) {
          app.applyEventsChanges(
            {
              update: [
                {
                  id: event.id,
                  updates: {
                    ...event,
                    id: DiaryEventDomain.createEventId(createdTask.id),
                    meta: {
                      ...diaryEvent.meta,
                      id: createdTask.id,
                    },
                  },
                },
              ],
            },
            false,
            'remote',
          );

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
  }, [app, client, createTask]);
}

export { useEventCreateSubscription };
