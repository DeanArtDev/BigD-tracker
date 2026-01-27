import type { MakeOptional } from '@/shared/lib/type-helpers';
import { cn } from '@/shared/ui-kit/utils';
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
    <div className="wysiwyg-editor relative flex flex-col w-full min-w-0 grow">
      <WysiwygProvider>
        <HistoryPlugin key={historyKey} />
        <ToolbarPlugin />

        <InitialStatePlugin
          state={state}
          onStateSet={() => void setHistoryKey((prev) => prev + 1)}
        />
        <DirtyTrackingPlugin initialStateString={state} onDirtyChange={onDirtyChange} />

        <div className="wysiwyg-editor-scroller relative flex flex-col grow min-h-0 flex-1 overflow-y-auto">
          {beforeSlot}

          <RichTextPlugin
            contentEditable={
              <div className="content-editable-resizer flex min-h-0 max-w-full relative resize-y">
                <div className="content-editable-resizer-wrapper flex-auto max-w-full relative resize-y">
                  <ContentEditable
                    className="content-editable grow min-h-[200px] flex-1 p-5 pb-10 sm:pb-7"
                    aria-placeholder={placeholder}
                    placeholder={
                      <div
                        className={cn(
                          'placeholder absolute top-5 left-5 right-0',
                          'text-gray-500 pointer-events-none inline-block truncate overflow-hidden select-none',
                        )}
                      >
                        {placeholder}
                      </div>
                    }
                  />
                </div>
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />

          {afterSlot}
        </div>

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
