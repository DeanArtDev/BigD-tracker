'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import { CAN_REDO_COMMAND, CAN_UNDO_COMMAND, COMMAND_PRIORITY_LOW, REDO_COMMAND, UNDO_COMMAND } from 'lexical';
import { Redo, Undo } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useWysiwygContext } from '../../context/context';
import { ToolbarAction } from '../../ui/toolbar-action';

function HistoryActions({ disabled }: { disabled: boolean }) {
  const [editor] = useLexicalComposerContext();
  const { state } = useWysiwygContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const isEditable = state.isEditable;

  useEffect(() => {
    const cleanup = mergeRegister(
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );

    return cleanup;
  }, [editor]);

  return (
    <div className="flex shrink-0">
      <ToolbarAction
        ariaLabel="Undo"
        icon={<Undo />}
        disabled={!isEditable || !canUndo || disabled}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
      />

      <ToolbarAction
        ariaLabel="Redo"
        icon={<Redo />}
        disabled={!isEditable || !canRedo || disabled}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
      />
    </div>
  );
}

export { HistoryActions };
