import { cn } from '@/shared/ui-kit/utils';
import { useRef } from 'react';
import { useWysiwygContext } from '../../context';
import { HistoryActions } from './history-actions';
import { TextAlignmentActions } from './text-alignment-actions';
import { TextFormatActions } from './text-format-actions';

function Divider() {
  return <div className="mx-2 h-full w-px bg-border" />;
}

function ToolbarPlugin() {
  const {
    state: { isEditable },
  } = useWysiwygContext();

  const toolbarRef = useRef(null);

  return (
    <div
      className={cn('toolbar flex flex-wrap mb-2 pb-1 sm:mb-3 border-b', { hidden: !isEditable })}
      ref={toolbarRef}
    >
      <HistoryActions />

      <Divider />

      <TextFormatActions />

      <Divider />

      <TextAlignmentActions />
    </div>
  );
}

export { ToolbarPlugin };
