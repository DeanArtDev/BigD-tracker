import { useForceRender } from '@/shared/lib/react/use-force-render';
import { Button } from '@/shared/ui-kit/ui/button';
import { cn } from '@/shared/ui-kit/utils';
import { NotebookPen } from 'lucide-react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

function EditTogglePlugin({ className, disabled }: { disabled?: boolean; className?: string }) {
  const [editor] = useLexicalComposerContext();
  const { forceRender } = useForceRender();
  const isEditable = editor.isEditable();

  const toggle = () => {
    const next = !isEditable;
    editor.setEditable(next);
    if (next) editor.focus();
    forceRender();
  };

  if (isEditable) return null;
  return (
    <Button
      className={cn(className)}
      disabled={disabled}
      type="button"
      size="icon"
      variant="ghost"
      onClick={toggle}
    >
      <NotebookPen className="size-4" color="var(--color-gray-500)" />
    </Button>
  );
}

export { EditTogglePlugin };
