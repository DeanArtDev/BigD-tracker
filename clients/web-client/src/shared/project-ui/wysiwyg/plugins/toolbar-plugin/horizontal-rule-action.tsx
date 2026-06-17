'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import { Minus } from 'lucide-react';
import { useWysiwygContext } from '../../context';
import { ToolbarAction } from '../../ui/toolbar-action';

function HorizontalRuleAction({ disabled }: { disabled: boolean }) {
  const [editor] = useLexicalComposerContext();
  const {
    state: { isEditable },
  } = useWysiwygContext();

  return (
    <ToolbarAction
      ariaLabel="Разделитель"
      icon={<Minus />}
      disabled={!isEditable || disabled}
      size="icon"
      variant="outline"
      className="min-w-10"
      onClick={() => {
        editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
      }}
    />
  );
}

export { HorizontalRuleAction };
