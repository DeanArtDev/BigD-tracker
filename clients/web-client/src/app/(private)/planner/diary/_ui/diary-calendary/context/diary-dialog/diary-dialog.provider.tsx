'use client';

import { type PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { TaskSubmitFormData } from '@/entity/planner/tasks';
import timeAndDate from '@/shared/lib/time';
import { useNotify } from '@/shared/project-ui';
import { diaryDialogContext, type DiaryDialogContext } from './diary-dialog.context';
import { EMPTY_GROUP_ID } from '../../model';
import { DiaryDialogActions } from '../../model/diary-dialog-actions';
import { DiaryEvent, EventTask } from '../../model/types';
import { DiaryEventDialog } from '../../ui/diary-event-dialog';
import { useDiaryContext } from '../diary-calendar';

interface DiaryDialogState {
  readonly event: DiaryEvent;
  readonly mode: 'create' | 'update';
  readonly task: EventTask;
}

function DiaryDialogProvider({ children }: PropsWithChildren) {
  const {
    calendar: { app },
  } = useDiaryContext();
  const [dialogState, setDialogState] = useState<DiaryDialogState>();
  const [open, setOpen] = useState(false);
  const { error, warning } = useNotify();

  const openDiaryDialog = useCallback<DiaryDialogContext['openDiaryDialog']>(
    (event, params) => {
      const isUpdate = event != null;
      const isCreate = event == null;

      if (isCreate) {
        const requestedCalendarId = params?.calendarId;
        const createdEvent = DiaryDialogActions.create({
          allDay: params?.allDay,
          calendarId: requestedCalendarId ?? EMPTY_GROUP_ID,
          date: params?.date ?? app.getCurrentDate(),
          viewType: params?.viewType,
        });

        const task = DiaryDialogActions.mapEventToTask(createdEvent);

        setDialogState({ event: createdEvent, mode: 'create', task });
      }

      if (isUpdate) {
        const e = DiaryDialogActions.withTaskMeta(event);
        const task = DiaryDialogActions.mapEventToTask(e);
        setDialogState({ event: e, mode: 'update', task });
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
      const { task } = dialogState;
      return {
        task: undefined,
        defaultValues: {
          name: task.name ?? undefined,
          startDate: task.startDate != null ? timeAndDate(task.startDate).toDate() : undefined,
          deadline: task.deadline != null ? timeAndDate(task.deadline).toDate() : undefined,
        },
      };
    }
    if (dialogState?.mode === 'update' && dialogState.event.meta.id != null) {
      return { task: { ...dialogState.task, id: dialogState.event.meta.id }, defaultValues: undefined };
    }

    if (dialogState != null && dialogState?.event.meta.id == null) {
      warning({ message: 'Дело не может быть создано или обновлено, не хватает данных' });
    }

    return { task: undefined, defaultValues: undefined };
  }, [dialogState, warning]);

  return (
    <diaryDialogContext.Provider value={value}>
      {children}

      {dialogState && (
        <DiaryEventDialog
          key={dialogState.event.id}
          app={app}
          open={open}
          defaultValues={taskToChange?.defaultValues}
          task={taskToChange?.task}
          title={dialogState.mode === 'create' ? 'Создание дела' : 'Редактирование дела'}
          onAnimationEnd={completeClosing}
          onOpenChange={setOpen}
          onSubmit={async (task: TaskSubmitFormData<GroupId>) => {
            if (!dialogState) return;
            const { startDate, deadline } = task;
            if (startDate == null || deadline == null) {
              error({ message: 'Дело должно иметь дату начала и окончания' });
              return;
            }

            if (dialogState.mode === 'create') {
              const eventToCreateDraft = DiaryDialogActions.create({
                allDay: false,
                date: timeAndDate(task.startDate).toDate(),
                defaultValues: {
                  status: task.status,
                  priority: task.priority,
                  startDate: timeAndDate(task.startDate).toDate(),
                  deadline: timeAndDate(task.deadline).toDate(),
                },
                calendarId: (task?.groupId as unknown as string) ?? EMPTY_GROUP_ID,
              });

              const eventToCreate: DiaryEvent = {
                ...eventToCreateDraft,
                title: task.name,
                description: task.description,
              };

              app.addEvent(eventToCreate);
            }

            if (dialogState.mode === 'update' && dialogState.event.meta.id != null) {
              const eventToUpdate = DiaryDialogActions.update({
                ...task,
                startDate,
                deadline,
                id: dialogState.event.meta.id,
                status: dialogState.task.status,
              });

              await app.updateEvent(dialogState.event.id, eventToUpdate);
            }

            setOpen(false);
          }}
        />
      )}
    </diaryDialogContext.Provider>
  );
}

export { DiaryDialogProvider };
