import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import type { EditorState } from 'lexical';
import { useCallback, useEffect, useEffectEvent, useRef } from 'react';
import { wysiwygTags } from '../utils';

interface DirtyTrackingPluginProps {
  initialStateString?: string | null;
  onDirtyChange: (dirty: boolean) => void;
}

function stableStringifyEditorState(state: EditorState): string {
  return JSON.stringify(state.toJSON());
}

function DirtyTrackingPlugin({ initialStateString, onDirtyChange }: DirtyTrackingPluginProps) {
  const baselineRef = useRef<string | null>(null);
  const dirtyRef = useRef<boolean>(false);
  const onDirtyChangeRef = useEffectEvent((value: boolean) => onDirtyChange(value));

  useEffect(() => {
    baselineRef.current = initialStateString ?? '';
    if (dirtyRef.current) {
      dirtyRef.current = false;
      onDirtyChangeRef(dirtyRef.current);
    }
  }, [initialStateString]);

  const handleChange = useCallback((editorState: EditorState, _: any, tags: Set<string>) => {
    if (tags.has(wysiwygTags.SILENT)) return;

    const baseline = baselineRef.current ?? '';
    const current = stableStringifyEditorState(editorState);

    const nextDirty = current !== baseline;
    if (nextDirty !== dirtyRef.current) {
      dirtyRef.current = nextDirty;
      onDirtyChangeRef(nextDirty);
    }
  }, []);

  return <OnChangePlugin ignoreSelectionChange onChange={handleChange} />;
}

export { DirtyTrackingPlugin };
