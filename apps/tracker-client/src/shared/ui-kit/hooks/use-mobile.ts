import { debounce } from 'lodash-es';
import { useSyncExternalStore } from 'react';

const MOBILE_BREAKPOINT = 768;

const throttled = debounce(() => window.innerWidth < MOBILE_BREAKPOINT, 400, {
  leading: true,
  trailing: false,
});

const subscribe = (callback: () => void) => {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
};

export function useIsMobile() {
  return useSyncExternalStore(subscribe, () => throttled(), () => false);
}
