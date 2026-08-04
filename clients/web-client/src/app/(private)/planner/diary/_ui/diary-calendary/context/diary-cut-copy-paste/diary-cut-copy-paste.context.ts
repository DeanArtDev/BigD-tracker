'use client';

import type { Event, ViewType } from '@dayflow/core';
import { createStrictContext, useStrictContext } from '@/shared/lib';

interface DiaryCutCopyPasteContext {
  readonly copyEvent: (event: Event) => Promise<void>;
  readonly cutEvent: (event: Event) => Promise<void>;
  readonly hasEventToPaste: () => boolean;
  readonly pasteEvent: (date: Date, viewType?: ViewType) => Promise<void>;
}

const diaryCutCopyPasteContext = createStrictContext<DiaryCutCopyPasteContext>();

const useDiaryCutCopyPasteContext = () => useStrictContext<DiaryCutCopyPasteContext>(diaryCutCopyPasteContext);

export { diaryCutCopyPasteContext, useDiaryCutCopyPasteContext, type DiaryCutCopyPasteContext };
