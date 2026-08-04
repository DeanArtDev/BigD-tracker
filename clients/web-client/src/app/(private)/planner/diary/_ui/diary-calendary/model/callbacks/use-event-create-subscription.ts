import { Event } from '@dayflow/core';
import { useEffect } from 'react';
import { TaskId } from '@/entity/planner/tasks';
import { invalidateTaskCreateCache, useTaskCreate } from '@/feature/planner/task-create';
import { useDiaryContext } from '../../context';
import { DiaryDialogActions } from '../diary-dialog-actions';

function useEventCreateSubscription() {
  const { calendar } = useDiaryContext();
  const { client, createTask } = useTaskCreate();

  const app = calendar.app;

  useEffect(() => {
    const createEvent = (event: Event) => {
      const diaryEvent = DiaryDialogActions.withTaskMeta(event);
      const task = DiaryDialogActions.mapEventToTask(diaryEvent);

      createTask({
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
      })
        .then(async ({ data }) => {
          const createdTask = data?.createTask;
          if (createdTask != null) {
            app.applyEventsChanges(
              {
                update: [
                  {
                    id: event.id,
                    updates: {
                      ...event,
                      meta: {
                        ...diaryEvent.meta,
                        id: createdTask.id as TaskId,
                      },
                    },
                  },
                ],
              },
              false,
              'remote',
            );
            await invalidateTaskCreateCache(client);
          }
        })
        .catch(() => {
          app.applyEventsChanges({ delete: [event.id] }, false, 'remote');
        });
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
