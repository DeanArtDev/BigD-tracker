import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import { useEffect, useEffectEvent, useRef } from 'react';

interface InitialStatePluginProps {
  readonly state?: string | null;
  readonly onStateSet?: () => void;
}

function InitialStatePlugin({ state, onStateSet }: InitialStatePluginProps) {
  const [editor] = useLexicalComposerContext();
  const lastLoadedRef = useRef<string | null | undefined>(state);

  const onStateSetRef = useEffectEvent(() => onStateSet?.());

  useEffect(() => {
    if (!state) return;

    if (lastLoadedRef.current === state) return;
    lastLoadedRef.current = state;

    editor.update(() => {
      try {
        const parsed = editor.parseEditorState(state);
        editor.setEditorState(parsed);
        onStateSetRef();
      } catch {
        const root = $getRoot();
        root.clear();
        const p = $createParagraphNode();
        p.append($createTextNode('Произошла ошибка загрузки данных'));
        root.append(p);
      }
    });
  }, [editor, state]);

  return null;
}

export { InitialStatePlugin, type InitialStatePluginProps };
