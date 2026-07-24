'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import type { EditorState, LexicalEditor } from 'lexical';
import { useCallback, useEffect, useRef } from 'react';
import { serializeEditorState, wysiwygTags } from '../utils';

interface StateChangePluginProps {
  readonly initialStateString?: string | null;
  readonly onDirtyChange: (dirty: boolean) => void;
  readonly onStateChange: (data: { isDirty: boolean }) => void;
}

function StateChangePlugin({ initialStateString, onDirtyChange, onStateChange }: StateChangePluginProps) {
  const [editor] = useLexicalComposerContext();
  const baselineRef = useRef<string | undefined>(getBaseline(editor, initialStateString));

  const dirtyRef = useRef<boolean>(false);
  const onDirtyChangeRef = useRef(onDirtyChange);
  const onStateChangeRef = useRef(onStateChange);
  onDirtyChangeRef.current = onDirtyChange;
  onStateChangeRef.current = onStateChange;

  useEffect(() => {
    baselineRef.current = getBaseline(editor, initialStateString);

    if (dirtyRef.current) {
      dirtyRef.current = false;
      onDirtyChangeRef.current(dirtyRef.current);
    }
  }, [editor, initialStateString]);

  const handleChange = useCallback((editorState: EditorState, _: LexicalEditor, tags: Set<string>) => {
    if (tags.has(wysiwygTags.SILENT)) return;

    const current = serializeEditorState(editorState);
    const baseline = baselineRef.current;

    const nextDirty = current !== baseline;
    onStateChangeRef.current({ isDirty: nextDirty });

    if (nextDirty !== dirtyRef.current) {
      dirtyRef.current = nextDirty;
      onDirtyChangeRef.current(nextDirty);
    }
  }, []);

  return <OnChangePlugin ignoreSelectionChange onChange={handleChange} />;
}

function getBaseline(editor: LexicalEditor, initialStateString?: string | null): string | undefined {
  if (!initialStateString) {
    return serializeEditorState(editor.getEditorState());
  }

  try {
    return serializeEditorState(editor.parseEditorState(initialStateString));
  } catch {
    return initialStateString;
  }
}

export { StateChangePlugin };
