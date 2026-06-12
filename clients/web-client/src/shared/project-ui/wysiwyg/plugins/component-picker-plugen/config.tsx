'use client';

import { INSERT_CHECK_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import { $createHeadingNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
  type LexicalEditor,
} from 'lexical';
import {
  FlipHorizontal,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  ListTodo,
  Pilcrow,
  TextAlignCenter,
  TextAlignEnd,
  TextAlignStart,
} from 'lucide-react';
import { ComponentPickerOption } from './option-model';

const headingMap = {
  1: <Heading1 />,
  2: <Heading2 />,
  3: <Heading3 />,
  4: <Heading4 />,
};

function getBaseOptions(editor: LexicalEditor) {
  return [
    ...([1, 2, 3, 4] as const).map(
      (item) =>
        new ComponentPickerOption(`Заголовок ${item}`, {
          icon: headingMap[item],
          keywords: ['heading', 'header', `h${item}`],
          onSelect: () =>
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode(`h${item}`));
              }
            }),
        }),
    ),

    new ComponentPickerOption('Параграф', {
      icon: <Pilcrow />,
      keywords: ['normal', 'paragraph', 'p', 'text'],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createParagraphNode());
          }
        }),
    }),

    new ComponentPickerOption('Список 1', {
      icon: <List />,
      keywords: ['bulleted list', 'unordered list', 'ul'],
      onSelect: () => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
    }),

    new ComponentPickerOption('Список 2', {
      icon: <ListOrdered />,
      keywords: ['numbered list', 'ordered list', 'ol'],
      onSelect: () => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
    }),

    new ComponentPickerOption('Чек лист', {
      icon: <ListTodo />,
      keywords: ['check list', 'todo list'],
      onSelect: () => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined),
    }),

    new ComponentPickerOption('Разделитель', {
      icon: <FlipHorizontal className="rotate-90" />,
      keywords: ['horizontal rule', 'divider', 'hr'],
      onSelect: () => editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined),
    }),

    new ComponentPickerOption('Текст левому краю', {
      icon: <TextAlignStart />,
      keywords: ['horizontal rule', 'divider', 'hr'],
      onSelect: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left'),
    }),
    new ComponentPickerOption('Текст центру', {
      icon: <TextAlignCenter />,
      keywords: ['horizontal rule', 'divider', 'hr'],
      onSelect: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center'),
    }),
    new ComponentPickerOption('Текст правому краю', {
      icon: <TextAlignEnd />,
      keywords: ['horizontal rule', 'divider', 'hr'],
      onSelect: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right'),
    }),
  ];
}

export { getBaseOptions };
