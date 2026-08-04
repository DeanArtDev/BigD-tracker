'use client';

import type { Event as DayflowEvent, ViewType } from '@dayflow/core';
import { createStrictContext, useStrictContext } from '@/shared/lib';

interface DiaryDialogOpenParams {
  readonly allDay?: boolean;
  readonly calendarId?: string;
  readonly date?: Date;
  readonly viewType?: ViewType;
}

interface DiaryDialogContext {
  readonly closeDiaryDialog: () => void;
  readonly openDiaryDialog: (event?: DayflowEvent, params?: DiaryDialogOpenParams) => void;
}

const diaryDialogContext = createStrictContext<DiaryDialogContext>();

const useDiaryDialogContext = () => useStrictContext<DiaryDialogContext>(diaryDialogContext);

export { diaryDialogContext, useDiaryDialogContext, type DiaryDialogContext, type DiaryDialogOpenParams };
