import { useTimeViewController } from '../context';
import { useCallback, useSyncExternalStore } from 'react';

function useCurrentTime() {
  const controller = useTimeViewController();

  const subscribe = useCallback(
    (listener: () => void) => {
      controller.on('initiated', listener).on('updated', listener);
      return () => void controller.off('initiated', listener).off('updated', listener);
    },
    [controller],
  );

  return useSyncExternalStore(subscribe, () => controller.state.currentTime);
}

export { useCurrentTime };
