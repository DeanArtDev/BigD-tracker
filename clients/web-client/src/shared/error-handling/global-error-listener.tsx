'use client';

import { useEffect } from 'react';
import { getEnvConfigClient } from '@/shared/lib';

const clientConfig = getEnvConfigClient();

function GlobalErrorListener() {
  useEffect(() => {
    if (clientConfig.IS_DEV || clientConfig.IS_TEST) {
      const abortController = new AbortController();

      window.addEventListener(
        'error',
        (e: ErrorEvent) => {
          console.error('[global-error-listener window.onerror]', e.error ?? e.message);
        },
        { signal: abortController.signal },
      );

      window.addEventListener(
        'unhandledrejection',
        (e: PromiseRejectionEvent) => {
          console.error('[global-error-listener unhandledrejection]', e.reason);
        },
        { signal: abortController.signal },
      );
      return () => void abortController.abort('Unmount');
    }
  }, []);

  return null;
}

export { GlobalErrorListener };
