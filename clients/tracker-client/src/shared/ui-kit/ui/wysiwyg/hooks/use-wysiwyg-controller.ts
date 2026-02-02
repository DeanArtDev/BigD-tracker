import { useRef } from 'react';

function useWysiwygController() {
  const wysiwygController = useRef<{ readonly getStateAsString?: () => string } | null>(null);

  return {
    wysiwygController,
  };
}

export { useWysiwygController };
