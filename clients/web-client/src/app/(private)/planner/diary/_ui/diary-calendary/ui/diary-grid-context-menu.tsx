'use client';

import type { GridContextMenuSlotArgs } from '@dayflow/core';
import { CalendarPlus, ClipboardPaste } from 'lucide-react';
import { PropsWithChildren } from 'react';
import { Button } from '@/shared/ui-kit';
import { useDiaryCutCopyPasteContext, useDiaryDialogContext } from '../context';

function DiaryGridContextMenu({ date, viewType, onClose }: GridContextMenuSlotArgs) {
  const { openDiaryDialog } = useDiaryDialogContext();
  const { hasEventToPaste, pasteEvent } = useDiaryCutCopyPasteContext();

  const createEvent = () => {
    openDiaryDialog(undefined, { date, viewType });
    onClose();
  };

  const pasteCalendarEvent = () => {
    void pasteEvent(date, viewType);
    onClose();
  };

  return (
    <div
      role="menu"
      aria-label="Действия с календарём"
      className="flex flex-col diary-grid-context-menu rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
    >
      <MenuItem onClick={createEvent}>
        <CalendarPlus />
        Новое событие
      </MenuItem>

      <MenuItem disabled={!hasEventToPaste()} onClick={pasteCalendarEvent}>
        <ClipboardPaste />
        Вставить сюда
      </MenuItem>
    </div>
  );
}

function MenuItem({ disabled, children, onClick }: PropsWithChildren<{ disabled?: boolean; onClick: () => void }>) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="default"
      role="menuitem"
      className="w-full justify-start px-1 font-normal"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export { DiaryGridContextMenu };
