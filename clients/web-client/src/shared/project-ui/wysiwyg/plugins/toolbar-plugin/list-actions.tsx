'use client';

import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  type ListType,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_LOW, SELECTION_CHANGE_COMMAND } from 'lexical';
import { List, ListOrdered, ListTodo } from 'lucide-react';
import { type ReactNode, useEffect, useEffectEvent, useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui-kit/ui/toggle-group';
import { useWysiwygContext } from '../../context';
import { getSelectedNode } from '../../utils';

const listOptions = [
  {
    icon: <List className="size-5" />,
    value: 'bullet',
    ariaLabel: 'Маркированный список',
  },
  {
    icon: <ListOrdered className="size-5" />,
    value: 'number',
    ariaLabel: 'Нумерованный список',
  },
  {
    icon: <ListTodo className="size-5" />,
    value: 'check',
    ariaLabel: 'Чек-лист',
  },
] as const satisfies ReadonlyArray<{
  icon: ReactNode;
  value: ListType;
  ariaLabel: string;
}>;

function isListType(value: string): value is ListType {
  return listOptions.some((option) => option.value === value);
}

function ListActions({ disabled }: { disabled: boolean }) {
  const [editor] = useLexicalComposerContext();
  const {
    state: { isEditable },
  } = useWysiwygContext();

  const [listType, setListType] = useState<ListType | ''>('');

  const $updateToolbar = useEffectEvent(() => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) return;

    const node = getSelectedNode(selection);
    const listNode = $isListNode(node) ? node : $findMatchingParent(node, $isListNode);

    setListType($isListNode(listNode) ? listNode.getListType() : '');
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
      value={listType}
      disabled={!isEditable || disabled}
      variant="outline"
      className="shrink-0"
      spacing={0}
      onValueChange={(value) => {
        if (!isListType(value)) {
          editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
          return;
        }

        if (value === 'bullet') {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
          return;
        }

        if (value === 'number') {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
          return;
        }

        editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
      }}
    >
      {listOptions.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value} aria-label={option.ariaLabel} className="min-w-10">
          {option.icon}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export { ListActions };
