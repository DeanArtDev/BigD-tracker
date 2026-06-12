'use client';

import { cn, ScrollAreaNativeHorizontal, Separator } from '@/shared/ui-kit';
import { HistoryActions } from './history-actions';
import { TextAlignmentActions } from './text-alignment-actions';
import { TextFormatActions } from './text-format-actions';
import { useWysiwygContext } from '../../context';

function ToolbarPlugin({ disabled }: { disabled: boolean }) {
  const {
    state: { isEditable },
  } = useWysiwygContext();

  return (
    <ScrollAreaNativeHorizontal
      className={cn('toolbar min-h-12.25 sticky p-2 sm:p-3 sm:py-2 border-b', {
        hidden: !isEditable,
      })}
    >
      <HistoryActions disabled={disabled} />

      <Separator className="mx-2" orientation="vertical" />

      <TextFormatActions disabled={disabled} />

      <Separator className="mx-2" orientation="vertical" />

      <TextAlignmentActions disabled={disabled} />
    </ScrollAreaNativeHorizontal>
  );
}

export { ToolbarPlugin };
