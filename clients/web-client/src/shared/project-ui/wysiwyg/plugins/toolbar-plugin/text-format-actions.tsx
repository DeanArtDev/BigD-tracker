'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_LOW, SELECTION_CHANGE_COMMAND } from 'lexical';
import { Bold, Italic, Strikethrough, Underline } from 'lucide-react';
import { useEffect, useEffectEvent, useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui-kit/ui/toggle-group';
import { dispatchFormatTextCommand } from './helpers';
import { useWysiwygContext } from '../../context';

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
      editor.registerUpdateListener(({ editorState }) => void editorState.read($updateToolbar, { editor })),

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

  const value = [
    ...(isBold ? ['bold'] : []),
    ...(isItalic ? ['italic'] : []),
    ...(isUnderline ? ['underline'] : []),
    ...(isStrikethrough ? ['strikethrough'] : []),
  ];

  return (
    <ToggleGroup
      type="multiple"
      value={value}
      disabled={!isEditable || disabled}
      variant="outline"
      className="shrink-0"
      spacing={0}
    >
      <ToggleGroupItem
        value="bold"
        aria-label="Bold"
        className="min-w-10"
        onClick={() => {
          dispatchFormatTextCommand(editor, 'bold');
        }}
      >
        <Bold />
      </ToggleGroupItem>

      <ToggleGroupItem
        value="italic"
        aria-label="Italic"
        className="min-w-10"
        onClick={() => {
          dispatchFormatTextCommand(editor, 'italic');
        }}
      >
        <Italic />
      </ToggleGroupItem>

      <ToggleGroupItem
        value="underline"
        aria-label="Underline"
        className="min-w-10"
        onClick={() => {
          dispatchFormatTextCommand(editor, 'underline');
        }}
      >
        <Underline />
      </ToggleGroupItem>

      <ToggleGroupItem
        value="strikethrough"
        aria-label="Strikethrough"
        className="min-w-10"
        onClick={() => {
          dispatchFormatTextCommand(editor, 'strikethrough');
        }}
      >
        <Strikethrough />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export { TextFormatActions };
