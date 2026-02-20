import { debounce } from 'lodash-es';
import { useSyncExternalStore } from 'react';

const LG_BREAKPOINT = 1024;

const throttled = debounce(() => window.innerWidth > LG_BREAKPOINT, 400, {
  leading: true,
  trailing: false,
});

const subscribe = (callback: () => void) => {
  const mql = window.matchMedia(`(max-width: ${LG_BREAKPOINT + 1}px)`);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
};

export function useIsLgUp() {
  return useSyncExternalStore(
    subscribe,
    () => throttled(),
    () => false,
  );
}
