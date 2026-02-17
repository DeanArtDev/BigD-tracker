import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { Bold, Italic, Strikethrough, Underline } from 'lucide-react';
import { useEffect, useEffectEvent, useState } from 'react';
import { useWysiwygContext } from '../../context';
import { ToolbarAction } from '../../ui/toolbar-action';
import { dispatchFormatTextCommand } from './helpers';

function TextFormatActions({ disabled }: { disabled: boolean }) {
  const [editor] = useLexicalComposerContext();
  const {
    state: { isEditable },
  } = useWysiwygContext();

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);

  const $updateToolbar = useEffectEvent(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
    }
  });

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(
        ({ editorState }) => void editorState.read($updateToolbar, { editor }),
      ),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor]);

  return (
    <div className="flex gap-1 shrink-0">
      <ToolbarAction
        ariaLabel="Bold"
        active={isBold}
        icon={<Bold />}
        disabled={!isEditable || disabled}
        onClick={() => {
          dispatchFormatTextCommand(editor, 'bold');
        }}
      />

      <ToolbarAction
        ariaLabel="Italic"
        active={isItalic}
        icon={<Italic />}
        disabled={!isEditable || disabled}
        onClick={() => {
          dispatchFormatTextCommand(editor, 'italic');
        }}
      />

      <ToolbarAction
        ariaLabel="Underline"
        active={isUnderline}
        icon={<Underline />}
        disabled={!isEditable || disabled}
        onClick={() => {
          dispatchFormatTextCommand(editor, 'underline');
        }}
      />

      <ToolbarAction
        ariaLabel="Strikethrough"
        active={isStrikethrough}
        icon={<Strikethrough />}
        disabled={!isEditable || disabled}
        onClick={() => {
          dispatchFormatTextCommand(editor, 'strikethrough');
        }}
      />
    </div>
  );
}

export { TextFormatActions };
