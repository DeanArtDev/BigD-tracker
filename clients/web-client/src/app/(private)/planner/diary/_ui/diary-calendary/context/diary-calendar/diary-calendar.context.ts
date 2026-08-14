'use client';

import { ICalendarApp } from '@dayflow/core';
import { createStrictContext, useStrictContext } from '@/shared/lib';
import type { YearViewMode } from '../../view-model/use-views';

interface DiaryCalendarContext {
  readonly app: ICalendarApp;
  readonly setYearViewMode: (mode: YearViewMode) => void;
  readonly yearViewMode: YearViewMode;
}

const diaryCalendarContext = createStrictContext<DiaryCalendarContext>();

const useDiaryContext = () => useStrictContext<DiaryCalendarContext>(diaryCalendarContext);

export { useDiaryContext, diaryCalendarContext, type DiaryCalendarContext };
