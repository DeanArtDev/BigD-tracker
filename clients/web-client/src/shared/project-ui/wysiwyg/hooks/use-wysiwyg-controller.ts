'use client';

import { useRef } from 'react';

function useWysiwygController() {
  const wysiwygController = useRef<{ readonly getStateAsString?: () => string | undefined } | null>(null);

  return {
    wysiwygController,
  };
}

export { useWysiwygController };
