import { useSyncExternalStore } from 'react';

const subscribe = (callback: () => void) => {
  const mql = window.matchMedia('(orientation: portrait)');
  mql.addEventListener('change', callback);
  return () => void mql.removeEventListener('change', callback);
};

export function useOrientation() {
  const value = useSyncExternalStore(subscribe, () => {
    return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
  });

  return {
    isLandscape: value === 'landscape',
    isPortrait: value === 'portrait',
  };
}
