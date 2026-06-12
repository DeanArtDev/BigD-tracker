'use client';

import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import type { EditorState } from 'lexical';
import { useCallback, useEffect, useRef } from 'react';
import { formElementsValues } from '@/shared/ui-kit/form';
import { wysiwygTags } from '../utils';

interface DirtyTrackingPluginProps {
  initialStateString?: string | null;
  onDirtyChange: (dirty: boolean) => void;
}

function stableStringifyEditorState(state: EditorState): string {
  return JSON.stringify(state.toJSON());
}

function DirtyTrackingPlugin({ initialStateString, onDirtyChange }: DirtyTrackingPluginProps) {
  const baselineRef = useRef<string | typeof formElementsValues.wysiwyg.value>(formElementsValues.wysiwyg.value);
  const initState = typeof initialStateString === 'string' ? initialStateString : formElementsValues.wysiwyg.value;

  const dirtyRef = useRef<boolean>(false);
  const onDirtyChangeRef = useRef(onDirtyChange);
  onDirtyChangeRef.current = onDirtyChange;

  useEffect(() => {
    baselineRef.current = initState;
    if (dirtyRef.current) {
      dirtyRef.current = false;
      onDirtyChangeRef.current(dirtyRef.current);
    }
  }, [initState]);

  const handleChange = useCallback((editorState: EditorState, _: unknown, tags: Set<string>) => {
    if (tags.has(wysiwygTags.SILENT)) return;

    const current = stableStringifyEditorState(editorState);
    if (baselineRef.current === formElementsValues.wysiwyg.value) {
      baselineRef.current = current;
      return;
    }

    const baseline = baselineRef.current;

    const nextDirty = current !== baseline;
    if (nextDirty !== dirtyRef.current) {
      dirtyRef.current = nextDirty;
      onDirtyChangeRef.current(nextDirty);
    }
  }, []);

  return <OnChangePlugin ignoreSelectionChange onChange={handleChange} />;
}

export { DirtyTrackingPlugin };
