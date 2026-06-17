'use client';

import { cn, ScrollAreaNativeHorizontal } from '@/shared/ui-kit';
import { BlockFormatActions } from './block-format-actions';
import { HistoryActions } from './history-actions';
import { HorizontalRuleAction } from './horizontal-rule-action';
import { ListActions } from './list-actions';
import { TextAlignmentActions } from './text-alignment-actions';
import { TextFormatActions } from './text-format-actions';
import { useWysiwygContext } from '../../context';

function ToolbarPlugin({ disabled }: { disabled: boolean }) {
  const {
    state: { isEditable },
  } = useWysiwygContext();

  return (
    <ScrollAreaNativeHorizontal className={cn('toolbar-scroller border-b', { hidden: !isEditable })}>
      <div className="flex min-w-max flex-nowrap gap-2 p-1.5 pb-3">
        <BlockFormatActions disabled={disabled} />
        <TextFormatActions disabled={disabled} />
        <TextAlignmentActions disabled={disabled} />
        <ListActions disabled={disabled} />
        <HorizontalRuleAction disabled={disabled} />
        <HistoryActions disabled={disabled} />
      </div>
    </ScrollAreaNativeHorizontal>
  );
}

export { ToolbarPlugin };
