'use client';

import { timeAndDate } from '@big-d/time';
import { type PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { getRecurrenceFromTaskFormData, TaskSubmitFormData, TaskUtils } from '@/entity/planner/tasks';
import { useNotify } from '@/shared/project-ui';
import { EMPTY_GROUP_ID } from '../../model';
import { DiaryEventDomain } from '../../model/diary-event-domain';
import { DiaryEvent, EventTask } from '../../model/types';
import { DiaryEventDialog } from '../../ui/diary-event-dialog';
import { useDiaryContext } from '../diary-calendar';
import { diaryDialogContext, type DiaryDialogContext } from './diary-dialog.context';

interface DiaryDialogState {
  readonly originEvent: DiaryEvent;
  readonly mode: 'create' | 'update';
  readonly originTask: EventTask;
}

function DiaryDialogProvider({ children }: PropsWithChildren) {
  const { app } = useDiaryContext();
  const [dialogState, setDialogState] = useState<DiaryDialogState>();
  const [open, setOpen] = useState(false);
  const { error, warning } = useNotify();

  const openDiaryDialog = useCallback<DiaryDialogContext['openDiaryDialog']>(
    (event, params) => {
      const isUpdate = event != null;
      const isCreate = event == null;

      if (isCreate) {
        const requestedCalendarId = params?.calendarId;
        const createdEvent = DiaryEventDomain.create({
          allDay: params?.allDay,
          calendarId: requestedCalendarId ?? EMPTY_GROUP_ID,
          date: params?.date ?? app.getCurrentDate(),
          viewType: params?.viewType,
        });

        const task = DiaryEventDomain.mapEventToTask(createdEvent);

        setDialogState({ originEvent: createdEvent, mode: 'create', originTask: task });
      }

      if (isUpdate) {
        const e = DiaryEventDomain.withTaskMeta(event);
        const task = DiaryEventDomain.mapEventToTask(e);
        setDialogState({ originEvent: e, mode: 'update', originTask: task });
      }

      setOpen(true);
    },
    [app],
  );

  const closeDiaryDialog = useCallback(() => setOpen(false), []);

  const completeClosing = () => {
    if (dialogState?.mode === 'update') app.onEventDetailToggle(null);
    setDialogState(undefined);
  };

  const value = useMemo<DiaryDialogContext>(
    () => ({ closeDiaryDialog, openDiaryDialog }),
    [closeDiaryDialog, openDiaryDialog],
  );

  const taskToChange = useMemo(() => {
    if (dialogState?.mode === 'create') {
      const { originTask } = dialogState;
      return {
        task: undefined,
        defaultValues: {
          name: originTask.name ?? undefined,
          startDate: originTask.startDate != null ? timeAndDate(originTask.startDate).toDate() : undefined,
          deadline: originTask.deadline != null ? timeAndDate(originTask.deadline).toDate() : undefined,
        },
      };
    }
    if (dialogState?.mode === 'update' && dialogState.originEvent.meta.id != null) {
      return { task: { ...dialogState.originTask, id: dialogState.originEvent.meta.id }, defaultValues: undefined };
    }
    if (dialogState != null && dialogState?.originEvent.meta.id == null) {
      warning({ message: 'Дело не может быть создано или обновлено, не хватает данных' });
    }

    return { task: undefined, defaultValues: undefined };
  }, [dialogState, warning]);

  return (
    <diaryDialogContext.Provider value={value}>
      {children}

      {dialogState && (
        <DiaryEventDialog
          key={dialogState.originEvent.id}
          app={app}
          open={open}
          defaultValues={taskToChange?.defaultValues}
          task={taskToChange?.task}
          title={dialogState.mode === 'create' ? 'Создание дела' : 'Редактирование дела'}
          onAnimationEnd={completeClosing}
          onOpenChange={setOpen}
          onSubmit={async (formDate: TaskSubmitFormData<GroupId>) => {
            if (!dialogState) return;
            const { startDate, deadline } = formDate;
            if (startDate == null || deadline == null) {
              error({ message: 'Дело должно иметь дату начала и окончания' });
              return;
            }

            if (dialogState.mode === 'create') {
              const eventToCreateDraft = DiaryEventDomain.create({
                allDay: false,
                date: timeAndDate(formDate.startDate).toDate(),
                defaultValues: {
                  status: formDate.status,
                  priority: formDate.priority,
                  recurrence: TaskUtils.getSafetyRecurrence(getRecurrenceFromTaskFormData(formDate)),
                  startDate: timeAndDate(formDate.startDate).toDate(),
                  deadline: timeAndDate(formDate.deadline).toDate(),
                },
                calendarId: formDate?.groupId?.toString() ?? EMPTY_GROUP_ID,
              });

              const eventToCreate: DiaryEvent = {
                ...eventToCreateDraft,
                title: formDate.name,
                description: formDate.description,
              };

              app.addEvent(eventToCreate);
            }

            if (dialogState.mode === 'update') {
              if (dialogState.originEvent.meta.id != null && taskToChange?.task?.settings != null) {
                const path = DiaryEventDomain.mapTaskToEvent({
                  ...taskToChange.task,
                  ...formDate,
                  recurrence: getRecurrenceFromTaskFormData(formDate),
                });

                if (Reflect.deleteProperty(path, 'id')) {
                  const eventToUpdate = DiaryEventDomain.update(dialogState.originEvent, path);
                  await app.updateEvent(dialogState.originEvent.id, eventToUpdate);
                }
              } else {
                warning({ message: 'meta.id or settings are not provided.' });
              }
            }

            setOpen(false);
          }}
        />
      )}
    </diaryDialogContext.Provider>
  );
}

export { DiaryDialogProvider };
