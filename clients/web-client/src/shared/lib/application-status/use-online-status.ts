'use client';

import { useSyncExternalStore } from 'react';

function useOnlineStatus(): boolean {
  const subscribe = (callback: () => void) => {
    const abortController = new AbortController();
    window.addEventListener('online', callback, { signal: abortController.signal });
    window.addEventListener('offline', callback, { signal: abortController.signal });
    return () => void abortController.abort();
  };

  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
}

export { useOnlineStatus };
