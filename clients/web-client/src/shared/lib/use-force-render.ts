'use client';

import { useCallback, useState } from 'react';

function useForceRender() {
  const [forceRenderVersion, setForceRenderVersion] = useState<number | null>(null);

  return {
    renderVersion: forceRenderVersion,
    forceRender: useCallback(() => void setForceRenderVersion(Math.random()), []),
  };
}

export { useForceRender };
