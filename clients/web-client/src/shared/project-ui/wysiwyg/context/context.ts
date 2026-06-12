'use client';

import { createStrictContext, useStrictContext } from '@/shared/lib';

interface WysiwygContext {
  readonly state: {
    readonly isEditable: boolean;
  };
  readonly setState: (state: Partial<WysiwygContext['state']>) => void;
}

const wysiwygContext = createStrictContext<WysiwygContext>();

const useWysiwygContext = () => useStrictContext<WysiwygContext>(wysiwygContext);

export { useWysiwygContext, wysiwygContext, type WysiwygContext };
