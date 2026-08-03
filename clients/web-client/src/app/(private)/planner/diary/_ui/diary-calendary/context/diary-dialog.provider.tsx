'use client';

import { clipboardStore, type EventDetailDialogProps } from '@dayflow/core';
import { type PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { TaskSubmitFormData } from '@/entity/planner/tasks';
import timeAndDate from '@/shared/lib/time';
import { useNotify } from '@/shared/project-ui';
import { useDiaryContext } from './context';
import { diaryDialogContext, type DiaryDialogContext, useDiaryDialogContext } from './diary-dialog.context';
import { DiaryDialogActions } from '../model/diary-dialog-actions';
import { DiaryEvent, EventTask } from '../model/types';
import { DiaryEventDialog } from '../ui/diary-event-dialog';

interface DiaryDialogState {
  readonly event: DiaryEvent;
  readonly mode: 'create' | 'update';
  readonly task: EventTask;
}

/*TODO:
 *
 * [] dbClick по гриду создает виртуальный event но в этот момент реальной таски еще нет
 *
 * */
function DiaryDialogProvider({ children }: PropsWithChildren) {
  const {
    calendar: { app },
  } = useDiaryContext();
  const [dialogState, setDialogState] = useState<DiaryDialogState>();
  const [open, setOpen] = useState(false);
  const { error } = useNotify();

  const openDiaryDialog = useCallback<DiaryDialogContext['openDiaryDialog']>(
    (event, params) => {
      const isUpdate = event != null && params?.defaultValues == null;
      const isCreate = event == null;

      if (isCreate) {
        const requestedCalendarId = params?.calendarId ?? params?.defaultValues?.groupId?.toString();
        const registry = app.getCalendarRegistry();
        const calendar = requestedCalendarId
          ? registry.get(requestedCalendarId)
          : registry.getDefaultWritableCalendar();
        const targetCalendar = calendar ?? registry.getDefaultWritableCalendar();
        if (!targetCalendar) return;

        const createdEvent = DiaryDialogActions.create({
          allDay: params?.allDay,
          calendarId: targetCalendar.id,
          date: params?.date ?? app.getCurrentDate(),
          defaultValues: params?.defaultValues,
          viewType: params?.viewType,
        });

        const task = DiaryDialogActions.mapEventToTask(createdEvent);

        setDialogState({
          event: createdEvent,
          mode: 'create',
          task: {
            ...task,
            groupId: params?.defaultValues?.groupId ?? task.groupId,
            priority: params?.defaultValues?.priority ?? task.priority,
          },
        });
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

  const pasteEvent = useCallback<DiaryDialogContext['pasteEvent']>(
    (date, viewType) => {
      const copiedEvent = clipboardStore.getEvent();
      if (!copiedEvent) return;

      const registry = app.getCalendarRegistry();
      const copiedEventCalendar = copiedEvent.calendarId ? registry.get(copiedEvent.calendarId) : undefined;
      const calendarId = copiedEventCalendar?.id ?? registry.getDefaultWritableCalendar()?.id;
      if (!calendarId) return;

      app.addEvent(
        DiaryDialogActions.paste(copiedEvent, {
          calendarId,
          date,
          timeZone: app.timeZone,
          viewType,
        }),
      );
    },
    [app],
  );

  const submitDialog = async (task: TaskSubmitFormData<GroupId>) => {
    if (!dialogState) return;

    const { startDate, deadline } = task;
    if (startDate != null && deadline != null && dialogState.task.id != null) {
      const event = DiaryDialogActions.update({
        ...task,
        startDate,
        deadline,
        id: dialogState.task.id,
        status: dialogState.task.status,
      });

      if (dialogState.mode === 'create') app.addEvent(event);
      else await app.updateEvent(dialogState.event.id, event);
    } else {
      error({ message: 'Дело должно иметь дату начала и окончания' });
    }

    setOpen(false);
  };

  const completeClosing = () => {
    if (dialogState?.mode === 'update') app.onEventDetailToggle(null);
    setDialogState(undefined);
  };

  const hasEventToPaste = useCallback(() => clipboardStore.hasEvent(), []);

  const value = useMemo<DiaryDialogContext>(
    () => ({
      closeDiaryDialog,
      hasEventToPaste,
      openDiaryDialog,
      pasteEvent,
    }),
    [closeDiaryDialog, openDiaryDialog, pasteEvent, hasEventToPaste],
  );

  const taskToChange = useMemo(() => {
    if (dialogState?.task == null) return undefined;
    if (dialogState.event.meta.id != null) {
      return { task: { ...dialogState.task, id: dialogState.event.meta.id }, defaultValues: undefined };
    }
    const { task } = dialogState;

    return {
      task: undefined,
      defaultValues: {
        ...task,
        name: task.name ?? undefined,
        description: task.description ?? undefined,
        startDate: task.startDate != null ? timeAndDate(task.startDate).toDate() : undefined,
        deadline: task.deadline != null ? timeAndDate(task.deadline).toDate() : undefined,
      },
    };
  }, [dialogState]);

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
          onSubmit={submitDialog}
        />
      )}
    </diaryDialogContext.Provider>
  );
}

function DiaryEventDetailDialog({ event, isOpen }: EventDetailDialogProps) {
  const { closeDiaryDialog, openDiaryDialog } = useDiaryDialogContext();
  const eventRef = useRef(event);
  eventRef.current = event;

  useEffect(() => {
    if (isOpen) openDiaryDialog(eventRef.current);
    else closeDiaryDialog();
  }, [closeDiaryDialog, event.id, isOpen, openDiaryDialog]);

  return null;
}

export { DiaryDialogProvider, DiaryEventDetailDialog };
