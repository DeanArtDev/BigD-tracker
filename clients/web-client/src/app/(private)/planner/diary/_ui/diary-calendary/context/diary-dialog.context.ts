'use client';

import type { Event as DayflowEvent, ViewType } from '@dayflow/core';
import { createStrictContext, useStrictContext } from '@/shared/lib';
import type { DiaryDialogDefaultValues } from '../model/diary-dialog-actions';

interface DiaryDialogOpenParams {
  readonly allDay?: boolean;
  readonly calendarId?: string;
  readonly date?: Date;
  readonly defaultValues?: DiaryDialogDefaultValues;
  readonly viewType?: ViewType;
}

interface DiaryDialogContext {
  readonly closeDiaryDialog: () => void;
  readonly hasEventToPaste: () => boolean;
  readonly openDiaryDialog: (event?: DayflowEvent, params?: DiaryDialogOpenParams) => void;
  readonly pasteEvent: (date: Date, viewType?: ViewType) => void;
}

const diaryDialogContext = createStrictContext<DiaryDialogContext>();

const useDiaryDialogContext = () => useStrictContext<DiaryDialogContext>(diaryDialogContext);

export { diaryDialogContext, useDiaryDialogContext, type DiaryDialogContext, type DiaryDialogOpenParams };
