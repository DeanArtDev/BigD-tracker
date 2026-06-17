'use client';

import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  HorizontalRuleNode,
  INSERT_HORIZONTAL_RULE_COMMAND,
} from '@lexical/extension';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $insertNodeToNearestRoot,
  addClassNamesToElement,
  mergeRegister,
  removeClassNamesFromElement,
} from '@lexical/utils';
import {
  $createNodeSelection,
  $getNodeFromDOMNode,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  isDOMNode,
  type LexicalNode,
  type NodeKey,
} from 'lexical';
import { useEffect } from 'react';

function $toggleNodeSelection(node: LexicalNode, shiftKey = false): void {
  const selection = $getSelection();
  const wasSelected = node.isSelected();
  const key = node.getKey();
  const nodeSelection = shiftKey && $isNodeSelection(selection) ? selection : $createNodeSelection();

  if (!$isNodeSelection(selection) || !shiftKey) {
    $setSelection(nodeSelection);
  }

  if (wasSelected) {
    nodeSelection.delete(key);
    return;
  }

  nodeSelection.add(key);
}

function HorizontalRulePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const nodeKeys = new Set<NodeKey>();
    const selectedClassName = editor._config.theme.hrSelected ?? 'selected';

    const syncSelectedClass = () => {
      const selectedKeys = new Set<NodeKey>();

      editor.getEditorState().read(() => {
        const selection = $getSelection();

        if ($isNodeSelection(selection)) {
          for (const node of selection.getNodes()) {
            if ($isHorizontalRuleNode(node)) {
              selectedKeys.add(node.getKey());
            }
          }
        }
      });

      for (const key of nodeKeys) {
        const element = editor.getElementByKey(key);

        if (!element) continue;

        if (selectedKeys.has(key)) {
          addClassNamesToElement(element, selectedClassName);
        } else {
          removeClassNamesFromElement(element, selectedClassName);
        }
      }
    };

    return mergeRegister(
      editor.registerCommand(
        INSERT_HORIZONTAL_RULE_COMMAND,
        () => {
          const selection = $getSelection();

          if (!$isRangeSelection(selection)) return false;

          const focusNode = selection.focus.getNode();

          if (focusNode !== null) {
            $insertNodeToNearestRoot($createHorizontalRuleNode());
          }

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          if (isDOMNode(event.target)) {
            const node = $getNodeFromDOMNode(event.target);

            if ($isHorizontalRuleNode(node)) {
              $toggleNodeSelection(node, event.shiftKey);
              return true;
            }
          }

          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerMutationListener(
        HorizontalRuleNode,
        (nodes) => {
          for (const [key, mutation] of nodes) {
            if (mutation === 'destroyed') {
              nodeKeys.delete(key);
            } else {
              nodeKeys.add(key);
            }
          }

          syncSelectedClass();
        },
        { skipInitialization: false },
      ),
      editor.registerUpdateListener(syncSelectedClass),
    );
  }, [editor]);

  return null;
}

export { HorizontalRulePlugin };
