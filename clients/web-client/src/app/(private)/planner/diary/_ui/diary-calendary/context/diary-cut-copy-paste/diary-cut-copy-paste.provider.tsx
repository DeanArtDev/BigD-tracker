'use client';

import { ViewType, Event } from '@dayflow/core';
import { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { useNotify } from '@/shared/project-ui';
import { diaryCutCopyPasteContext, type DiaryCutCopyPasteContext } from './diary-cut-copy-paste.context';
import { EMPTY_GROUP_ID } from '../../model/constants';
import { DiaryDialogActions } from '../../model/diary-dialog-actions';
import { useDiaryContext } from '../diary-calendar';

type ClipboardAction = 'copy' | 'cut';

function DiaryCutCopyPasteProvider({ children }: PropsWithChildren) {
  const {
    calendar: { app },
  } = useDiaryContext();
  const { error } = useNotify();
  const [clipboardAction, setClipboardAction] = useState<ClipboardAction>();
  const [clipboardEvent, setClipboardEvent] = useState<Event | null>(null);

  const writeEventToClipboard = useCallback(
    async (event: Event, action: ClipboardAction) => {
      try {
        setClipboardEvent(event);
        if (action === 'cut') {
          app.applyEventsChanges({ delete: [event.id] }, false, 'remote');
        }
        setClipboardAction(action);
      } catch {
        error({ message: 'Не удалось скопировать дело, попробуйте еще.' });
      }
    },
    [app, error],
  );

  const copyEvent = useCallback<DiaryCutCopyPasteContext['copyEvent']>(
    (event) => writeEventToClipboard(event, 'copy'),
    [writeEventToClipboard],
  );

  const cutEvent = useCallback<DiaryCutCopyPasteContext['cutEvent']>(
    (event) => writeEventToClipboard(event, 'cut'),
    [writeEventToClipboard],
  );

  const pasteEvent = useCallback<DiaryCutCopyPasteContext['pasteEvent']>(
    async (date: Date, viewType?: ViewType) => {
      const copiedEvent = clipboardEvent;
      if (copiedEvent == null || clipboardAction == null) return;

      const pastedEvent = DiaryDialogActions.paste(copiedEvent, {
        calendarId: copiedEvent.calendarId ?? EMPTY_GROUP_ID,
        date,
        timeZone: app.timeZone,
        viewType,
      });

      if (clipboardAction === 'copy') {
        app.addEvent(pastedEvent);
      } else if (clipboardAction === 'cut') {
        const movedEvent: Event = {
          ...pastedEvent,
          id: copiedEvent.id,
          meta: DiaryDialogActions.withTaskMeta(copiedEvent).meta,
        };
        app.applyEventsChanges({ add: [copiedEvent] }, false, 'remote');
        await app.updateEvent(copiedEvent.id, movedEvent, false, 'local');
      }

      setClipboardEvent(null);
    },
    [app, clipboardAction, clipboardEvent],
  );

  const hasEventToPaste = useCallback(
    () => clipboardAction != null && clipboardEvent != null,
    [clipboardEvent, clipboardAction],
  );

  const value = useMemo<DiaryCutCopyPasteContext>(
    () => ({ copyEvent, cutEvent, hasEventToPaste, pasteEvent }),
    [copyEvent, cutEvent, hasEventToPaste, pasteEvent],
  );

  return <diaryCutCopyPasteContext.Provider value={value}>{children}</diaryCutCopyPasteContext.Provider>;
}

export { DiaryCutCopyPasteProvider };
