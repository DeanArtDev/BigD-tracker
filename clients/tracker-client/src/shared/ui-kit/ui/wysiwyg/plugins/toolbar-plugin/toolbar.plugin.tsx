import { ScrollAreaNativeHorizontal } from '@/shared/ui-kit/ui/scroll-area-native-horizontal';
import { cn } from '@/shared/ui-kit/utils';
import { useWysiwygContext } from '../../context';
import { HistoryActions } from './history-actions';
import { TextAlignmentActions } from './text-alignment-actions';
import { TextFormatActions } from './text-format-actions';

function Divider() {
  return <div className="mx-2 h-6 w-px bg-border shrink-0" />;
}

function ToolbarPlugin() {
  const {
    state: { isEditable },
  } = useWysiwygContext();

  return (
    <ScrollAreaNativeHorizontal
      className={cn('toolbar min-h-12.25 sticky p-2 sm:p-3 sm:py-2 border-b', {
        hidden: !isEditable,
      })}
    >
      <HistoryActions />

      <Divider />

      <TextFormatActions />

      <Divider />

      <TextAlignmentActions />
    </ScrollAreaNativeHorizontal>
  );
}

export { ToolbarPlugin };
