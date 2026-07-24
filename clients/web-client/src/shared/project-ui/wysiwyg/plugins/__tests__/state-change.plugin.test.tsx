import { type InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { act, render, waitFor } from '@testing-library/react';
import { $createParagraphNode, $createTextNode, $getRoot, type LexicalEditor } from 'lexical';
import type { MutableRefObject } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { serializeEditorState } from '../../utils';
import { StateChangePlugin } from '../state-change.plugin';

interface EditorRefPluginProps {
  editorRef: MutableRefObject<LexicalEditor | null>;
}

function EditorRefPlugin({ editorRef }: EditorRefPluginProps) {
  const [editor] = useLexicalComposerContext();
  editorRef.current = editor;

  return null;
}

describe('StateChangePlugin', () => {
  it('normalizes empty content and restores clean state after removing the first input', async () => {
    const onDirtyChange = vi.fn();
    const onStateChange = vi.fn();
    const editorRef: MutableRefObject<LexicalEditor | null> = { current: null };
    const initialConfig: InitialConfigType = {
      namespace: 'dirty-state-plugin-test',
      onError: (error) => {
        throw error;
      },
    };

    render(
      <LexicalComposer initialConfig={initialConfig}>
        <StateChangePlugin onDirtyChange={onDirtyChange} onStateChange={onStateChange} />
        <EditorRefPlugin editorRef={editorRef} />
      </LexicalComposer>,
    );

    await waitFor(() => {
      expect(editorRef.current?.getEditorState().toJSON().root.children).toHaveLength(1);
    });

    expect(serializeEditorState(editorRef.current!.getEditorState())).toBeUndefined();

    act(() => {
      editorRef.current?.update(
        () => {
          const root = $getRoot();
          root.clear();
          root.append($createParagraphNode().append($createTextNode('a')));
        },
        { discrete: true },
      );
    });

    expect(onDirtyChange).toHaveBeenCalledTimes(1);
    expect(onDirtyChange).toHaveBeenCalledWith(true);
    expect(onStateChange).toHaveBeenCalledTimes(1);
    expect(onStateChange).toHaveBeenCalledWith({ isDirty: true });
    expect(serializeEditorState(editorRef.current!.getEditorState())).toEqual(expect.any(String));

    act(() => {
      editorRef.current?.update(
        () => {
          const root = $getRoot();
          root.clear();
          root.append($createParagraphNode().append($createTextNode('ab')));
        },
        { discrete: true },
      );
    });

    expect(onDirtyChange).toHaveBeenCalledTimes(1);
    expect(onStateChange).toHaveBeenCalledTimes(2);
    expect(onStateChange).toHaveBeenLastCalledWith({ isDirty: true });

    act(() => {
      editorRef.current?.update(
        () => {
          const root = $getRoot();
          root.clear();
          root.append($createParagraphNode());
        },
        { discrete: true },
      );
    });

    expect(onDirtyChange).toHaveBeenCalledTimes(2);
    expect(onDirtyChange).toHaveBeenLastCalledWith(false);
    expect(onStateChange).toHaveBeenCalledTimes(3);
    expect(onStateChange).toHaveBeenLastCalledWith({ isDirty: false });
    expect(serializeEditorState(editorRef.current!.getEditorState())).toBeUndefined();
  });
});
