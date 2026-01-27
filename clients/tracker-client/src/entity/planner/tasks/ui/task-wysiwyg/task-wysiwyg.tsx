import { WysiwygEditor, type WysiwygEditorProps } from '@/shared/ui-kit/ui/wysiwyg';
import { EditTogglePlugin } from '@/shared/ui-kit/ui/wysiwyg/plugins';

interface TaskWysiwygProps {
  readonly name: string;
  readonly placeholder?: string;
  readonly editable?: boolean;
  readonly state: WysiwygEditorProps['state'];
  readonly controller?: WysiwygEditorProps['controller'];
  readonly onDirtyChange?: WysiwygEditorProps['onDirtyChange'];
}

function TaskWysiwyg({
  placeholder,
  name,
  editable,
  state,
  controller,
  onDirtyChange,
}: TaskWysiwygProps) {
  return (
    <WysiwygEditor
      config={{ namespace: name, editable }}
      placeholder={placeholder}
      state={state}
      controller={controller}
      afterSlot={<EditTogglePlugin className="toggle-button absolute top-2 right-2" />}
      onDirtyChange={onDirtyChange}
    />
  );
}

export { TaskWysiwyg, type TaskWysiwygProps };
