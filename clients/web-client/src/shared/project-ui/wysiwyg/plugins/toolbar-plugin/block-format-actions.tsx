'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createHeadingNode, $isHeadingNode, type HeadingTagType } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { mergeRegister } from '@lexical/utils';
import {
  $createParagraphNode,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  type LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { useEffect, useEffectEvent, useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui-kit/ui/toggle-group';
import { useWysiwygContext } from '../../context';

type HeadingBlockFormat = Extract<HeadingTagType, 'h1' | 'h2' | 'h3' | 'h4'>;
type BlockFormat = HeadingBlockFormat | 'paragraph';

const blockFormatOptions = [
  { label: 'H1', value: 'h1', ariaLabel: 'Заголовок 1' },
  { label: 'H2', value: 'h2', ariaLabel: 'Заголовок 2' },
  { label: 'H3', value: 'h3', ariaLabel: 'Заголовок 3' },
  { label: 'H4', value: 'h4', ariaLabel: 'Заголовок 4' },
  { label: 'P', value: 'paragraph', ariaLabel: 'Параграф' },
] as const satisfies ReadonlyArray<{
  label: string;
  value: BlockFormat;
  ariaLabel: string;
}>;

function isToolbarBlockFormat(value: string): value is BlockFormat {
  return blockFormatOptions.some((option) => option.value === value);
}

function dispatchBlockFormatCommand(editor: LexicalEditor, blockFormat: BlockFormat) {
  editor.update(() => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) return;

    $setBlocksType(selection, () =>
      blockFormat === 'paragraph' ? $createParagraphNode() : $createHeadingNode(blockFormat),
    );
  });
}

function BlockFormatActions({ disabled }: { disabled: boolean }) {
  const [editor] = useLexicalComposerContext();
  const {
    state: { isEditable },
  } = useWysiwygContext();

  const [blockFormat, setBlockFormat] = useState<BlockFormat | ''>('paragraph');

  const $updateToolbar = useEffectEvent(() => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) return;

    const anchorNode = selection.anchor.getNode();
    const topLevelElement = anchorNode.getKey() === 'root' ? null : anchorNode.getTopLevelElement();

    if ($isHeadingNode(topLevelElement)) {
      const tag = topLevelElement.getTag();

      if (isToolbarBlockFormat(tag)) {
        setBlockFormat(tag);
        return;
      }

      setBlockFormat('');
      return;
    }

    setBlockFormat($isParagraphNode(topLevelElement) ? 'paragraph' : '');
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

  return (
    <ToggleGroup
      type="single"
      value={blockFormat}
      disabled={!isEditable || disabled}
      variant="outline"
      className="shrink-0"
      spacing={0}
      onValueChange={(value) => {
        dispatchBlockFormatCommand(editor, isToolbarBlockFormat(value) ? value : 'paragraph');
      }}
    >
      {blockFormatOptions.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          aria-label={option.ariaLabel}
          className="min-w-10 text-md"
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export { BlockFormatActions };
