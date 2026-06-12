'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import { type PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { wysiwygContext, type WysiwygContext } from './context';

type WysiwygProviderProps = PropsWithChildren;

function WysiwygProvider({ children }: WysiwygProviderProps) {
  const [editor] = useLexicalComposerContext();
  const [wysiwygState, setWysiwygState] = useState<WysiwygContext['state']>({
    isEditable: editor.isEditable(),
  });

  const value = useMemo<WysiwygContext>(
    () => ({
      state: wysiwygState,
      setState: (state) => {
        setWysiwygState((prev) => ({ ...prev, ...state }));
      },
    }),
    [wysiwygState],
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((isEditable) => {
        setWysiwygState((prev) => ({ ...prev, isEditable }));
      }),
    );
  }, [editor]);

  return <wysiwygContext.Provider value={value}>{children}</wysiwygContext.Provider>;
}

export { WysiwygProvider, type WysiwygProviderProps };
