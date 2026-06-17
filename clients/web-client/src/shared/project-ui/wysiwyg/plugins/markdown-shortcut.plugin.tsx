'use client';

import { $insertList, type ListType } from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_HIGH,
  KEY_SPACE_COMMAND,
  type ElementNode,
  type RangeSelection,
  type TextNode,
} from 'lexical';
import { useEffect } from 'react';

const LIST_SHORTCUTS = [
  { marker: '-', listType: 'bullet' },
  { marker: '1.', listType: 'number' },
  { marker: '[]', listType: 'check' },
] satisfies Array<{ marker: string; listType: ListType }>;

interface LeadingListMarker {
  readonly marker: string;
  readonly listType: ListType;
  readonly node: TextNode;
}

function getLeadingListMarker(selection: RangeSelection, block: ElementNode): LeadingListMarker | null {
  const anchor = selection.anchor;
  const anchorNode = anchor.getNode();
  const firstDescendant = block.getFirstDescendant();

  if (!$isTextNode(anchorNode) || !$isTextNode(firstDescendant)) return null;
  if (!anchorNode.is(firstDescendant)) return null;

  const textContent = firstDescendant.getTextContent();
  const shortcut = LIST_SHORTCUTS.find(({ marker }) => {
    return anchor.offset === marker.length && textContent.startsWith(marker);
  });

  if (!shortcut) return null;

  return {
    ...shortcut,
    node: firstDescendant,
  };
}

function removeLeadingListMarker(markerNode: TextNode, marker: string) {
  const textContent = markerNode.getTextContent();

  if (textContent.length === marker.length) {
    markerNode.remove();

    return;
  }

  markerNode.setTextContent(textContent.slice(marker.length));
}

function MarkdownShortcutPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_SPACE_COMMAND,
      (event) => {
        if (!editor.isEditable()) return false;

        const selection = $getSelection();

        if (!$isRangeSelection(selection) || !selection.isCollapsed()) return false;

        const anchorNode = selection.anchor.getNode();
        const block = anchorNode.getTopLevelElement();

        if (!$isParagraphNode(block)) return false;

        const markerNode = getLeadingListMarker(selection, block);

        if (!markerNode) return false;

        event.preventDefault();
        removeLeadingListMarker(markerNode.node, markerNode.marker);
        block.selectStart();
        $insertList(markerNode.listType);

        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);

  return null;
}

export { MarkdownShortcutPlugin };
