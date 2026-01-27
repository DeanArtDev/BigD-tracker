import type { MakeOptional } from '@/shared/lib/type-helpers';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { noop } from 'lodash-es';
import {
  ContentEditable,
  DirtyTrackingPlugin,
  LexicalErrorBoundary,
  RichTextPlugin,
  TabIndentationPlugin,
  ToolbarPlugin,
} from './plugins';
import { commonTheme } from './themes';
import { type InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { type ReactNode, type Ref, useImperativeHandle, useState } from 'react';
import { WysiwygProvider } from './context/provider';
import { InitialStatePlugin, type InitialStatePluginProps } from './plugins/initial-state.plugin';

function onError(error: unknown) {
  console.error('WysiwygEditor, ', error);
}

interface WysiwygEditorProps {
  readonly beforeSlot?: ReactNode;
  readonly afterSlot?: ReactNode;
  readonly state?: InitialStatePluginProps['state'];
  readonly placeholder?: string;
  readonly config?: MakeOptional<InitialConfigType, 'namespace' | 'onError'>;
  readonly controller?: Ref<{
    readonly getStateAsString?: () => string;
  }>;
  readonly onDirtyChange?: (value: boolean) => void;
}

function Component({
  state,
  placeholder = 'Введите текст',
  controller,
  beforeSlot,
  afterSlot,
  onDirtyChange = noop,
}: Omit<WysiwygEditorProps, 'config'>) {
  const [historyKey, setHistoryKey] = useState(0);

  const [editor] = useLexicalComposerContext();
  useImperativeHandle(controller, () => {
    return {
      getStateAsString: () => JSON.stringify(editor.getEditorState().toJSON()),
    };
  });

  return (
    <div className="flex flex-col wysiwyg-editor w-full">
      <WysiwygProvider>
        <HistoryPlugin key={historyKey} />

        <InitialStatePlugin
          state={state}
          onStateSet={() => void setHistoryKey((prev) => prev + 1)}
        />
        <DirtyTrackingPlugin initialStateString={state} onDirtyChange={onDirtyChange} />

        <ToolbarPlugin />

        <RichTextPlugin
          contentEditable={
            <div className="relative flex flex-col grow min-h-0 flex-1 overflow-y-auto">
              {beforeSlot}

              <ContentEditable
                className="relative grow min-h-0 flex-1"
                aria-placeholder={placeholder}
                placeholder={
                  <div className="absolute top-0 left-0 right-0 text-gray-500">{placeholder}</div>
                }
              />

              {afterSlot}
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />

        <TabIndentationPlugin />
      </WysiwygProvider>
    </div>
  );
}

function WysiwygEditor({ config, ...props }: WysiwygEditorProps) {
  const cfg: InitialConfigType = {
    ...(config ?? {}),
    onError,
    namespace: 'EMPTY EDITOR',
    theme: commonTheme,
  };

  return (
    <LexicalComposer initialConfig={cfg}>
      <Component {...props} />
    </LexicalComposer>
  );
}

export { WysiwygEditor, type WysiwygEditorProps };
