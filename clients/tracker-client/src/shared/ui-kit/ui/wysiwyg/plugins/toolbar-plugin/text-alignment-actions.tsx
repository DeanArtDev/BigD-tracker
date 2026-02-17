import { ToggleGroup, ToggleGroupItem } from '@/shared/ui-kit/ui/toggle-group';
import { $isLinkNode } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  type ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
} from 'lexical';
import { TextAlignStart, TextAlignEnd, TextAlignCenter, TextAlignJustify } from 'lucide-react';
import { useEffect, useEffectEvent, useState } from 'react';
import { useWysiwygContext } from '../../context';
import { getSelectedNode } from '../../utils';

function TextAlignmentActions({ disabled }: { disabled: boolean }) {
  const [editor] = useLexicalComposerContext();
  const {
    state: { isEditable },
  } = useWysiwygContext();

  const [elementFormat, setElementFormat] = useState<ElementFormatType>('left');

  const $updateToolbar = useEffectEvent(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();

      let matchingParent;
      if ($isLinkNode(parent)) {
        matchingParent = $findMatchingParent(
          node,
          (parentNode) => $isElementNode(parentNode) && !parentNode.isInline(),
        );
      }

      setElementFormat(
        $isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(node)
            ? node.getFormatType()
            : parent?.getFormatType() || 'left',
      );
    }
  });

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(
        ({ editorState }) => void editorState.read($updateToolbar, { editor }),
      ),
    );
  }, [editor]);

  return (
    <ToggleGroup
      size="sm"
      type="single"
      value={elementFormat}
      disabled={!isEditable || disabled}
      variant="outline"
      className="flex shrink-0"
      spacing={1}
      onValueChange={(value: ElementFormatType) => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, value);
      }}
    >
      <ToggleGroupItem value="left" aria-label="Left Align">
        <TextAlignStart />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Center Align">
        <TextAlignCenter />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Right Align">
        <TextAlignEnd />
      </ToggleGroupItem>
      <ToggleGroupItem value="justify" aria-label="Justify">
        <TextAlignJustify />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export { TextAlignmentActions };
