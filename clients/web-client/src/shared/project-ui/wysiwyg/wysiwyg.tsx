'use client';

import { HorizontalRuleNode } from '@lexical/extension';
import { ListItemNode, ListNode } from '@lexical/list';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { type InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { noop } from 'lodash-es';
import { type ReactNode, type Ref, useImperativeHandle, useState } from 'react';
import { getEnvConfigClient } from '@/shared/lib';
import type { MakeOptional } from '@/shared/lib/type-helpers';
import { cn, ScrollAreaNativeVertical } from '@/shared/ui-kit';
import { WysiwygProvider } from './context/provider';
import {
  ContentEditable,
  HorizontalRulePlugin,
  LexicalErrorBoundary,
  MarkdownShortcutPlugin,
  RichTextPlugin,
  StateChangePlugin,
  TabIndentationPlugin,
  ToolbarPlugin,
} from './plugins';
import { InitialStatePlugin, type InitialStatePluginProps } from './plugins/initial-state.plugin';
import { commonTheme } from './themes';
import { serializeEditorState } from './utils';

const clientConfig = getEnvConfigClient();
function onError(error: unknown) {
  if (!clientConfig.IS_PROD) {
    console.error('WysiwygEditor, ', error);
  }
}

interface WysiwygEditorProps {
  readonly disabled?: boolean;
  readonly beforeSlot?: ReactNode;
  readonly afterSlot?: ReactNode;
  readonly state?: InitialStatePluginProps['state'];
  readonly placeholder?: string;
  readonly config?: MakeOptional<InitialConfigType, 'namespace' | 'onError'>;
  readonly controller?: Ref<{
    readonly getStateAsString?: () => string | undefined;
  }>;
  readonly onDirtyChange?: (value: boolean) => void;
  readonly onStateChange?: (data: { isDirty: boolean }) => void;
}

function Component({
  state,
  placeholder = 'Введите текст',
  controller,
  beforeSlot,
  disabled = false,
  afterSlot,
  onDirtyChange = noop,
  onStateChange = noop,
}: Omit<WysiwygEditorProps, 'config'>) {
  const [historyKey, setHistoryKey] = useState(0);

  const [editor] = useLexicalComposerContext();
  useImperativeHandle(controller, () => {
    return {
      getStateAsString: () => serializeEditorState(editor.getEditorState()),
    };
  });

  return (
    <div className="wysiwyg-editor relative grid grid-rows-[max-content_1fr] w-full min-h-0 min-w-0 grow">
      <WysiwygProvider>
        <HistoryPlugin key={historyKey} />
        <ToolbarPlugin disabled={disabled} />

        <InitialStatePlugin state={state} onStateSet={() => void setHistoryKey((prev) => prev + 1)} />
        <StateChangePlugin initialStateString={state} onDirtyChange={onDirtyChange} onStateChange={onStateChange} />

        <ScrollAreaNativeVertical className="wysiwyg-editor-scroller relative">
          {beforeSlot}

          <RichTextPlugin
            contentEditable={
              <div className="content-editable-resizer flex max-w-full grow relative resize-y">
                <div className="content-editable-resizer-wrapper flex-auto max-w-full relative resize-y">
                  <ContentEditable
                    disabled={disabled}
                    className="group/content-editable outline-none grow min-h-[200px] flex-1 p-5 pb-10 sm:pb-7 text-base [&_*:focus-visible]:outline-none"
                    aria-placeholder={placeholder}
                    placeholder={
                      <div
                        className={cn(
                          'placeholder absolute top-6 left-5 right-0',
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
        </ScrollAreaNativeVertical>
        <ListPlugin />
        <CheckListPlugin />
        <TabIndentationPlugin />
        <HorizontalRulePlugin />
        <MarkdownShortcutPlugin />
      </WysiwygProvider>
    </div>
  );
}

function WysiwygEditor({ config, ...props }: WysiwygEditorProps) {
  const cfg: InitialConfigType = {
    ...(config ?? {}),
    onError,
    editable: !props.disabled && config?.editable,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, HorizontalRuleNode],
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
