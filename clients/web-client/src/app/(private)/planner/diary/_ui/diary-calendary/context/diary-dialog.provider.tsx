'use client';

import { clipboardStore, type EventDetailDialogProps } from '@dayflow/core';
import { type PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { Task, TaskSubmitFormData } from '@/entity/planner/tasks';
import { useNotify } from '@/shared/project-ui';
import { useDiaryContext } from './context';
import { diaryDialogContext, type DiaryDialogContext, useDiaryDialogContext } from './diary-dialog.context';
import { DiaryDialogActions, type DiaryEvent } from '../model/diary-dialog-actions';
import { DiaryEventDialog } from '../ui/diary-event-dialog';

interface DiaryDialogState {
  readonly event: DiaryEvent;
  readonly mode: 'create' | 'update';
  readonly task: Task<GroupId>;
}

function DiaryDialogProvider({ children }: PropsWithChildren) {
  const {
    calendar: { app },
  } = useDiaryContext();
  const [dialogState, setDialogState] = useState<DiaryDialogState>();
  const [open, setOpen] = useState(false);
  const { error } = useNotify();

  const openDiaryDialog = useCallback<DiaryDialogContext['openDiaryDialog']>(
    (event, params) => {
      let dialogEvent = event ? DiaryDialogActions.withTaskMeta(event) : undefined;

      if (!dialogEvent) {
        const requestedCalendarId = params?.calendarId ?? params?.defaultValues?.groupId?.toString();
        const registry = app.getCalendarRegistry();
        const calendar = requestedCalendarId
          ? registry.get(requestedCalendarId)
          : registry.getDefaultWritableCalendar();
        const targetCalendar = calendar ?? registry.getDefaultWritableCalendar();
        if (!targetCalendar) return;

        dialogEvent = DiaryDialogActions.create({
          allDay: params?.allDay,
          calendarId: targetCalendar.id,
          date: params?.date ?? app.getCurrentDate(),
          defaultValues: params?.defaultValues,
          viewType: params?.viewType,
        });
      }

      const task = DiaryDialogActions.mapEventToTask(dialogEvent);
      const isUpdate = event != null && params?.defaultValues == null;
      const isCreate = event == null;

      if (isCreate) {
        setDialogState({
          event: dialogEvent,
          mode: 'create',
          task: {
            ...task,
            groupId: params?.defaultValues?.groupId ?? task.groupId,
            priority: params?.defaultValues?.priority ?? task.priority,
          },
        });
      } else if (isUpdate) {
        setDialogState({ event: dialogEvent, mode: 'update', task });
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
    if (startDate != null && deadline != null) {
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

  return (
    <diaryDialogContext.Provider value={value}>
      {children}

      {dialogState && (
        <DiaryEventDialog
          key={dialogState.event.id}
          app={app}
          open={open}
          task={dialogState.task}
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
