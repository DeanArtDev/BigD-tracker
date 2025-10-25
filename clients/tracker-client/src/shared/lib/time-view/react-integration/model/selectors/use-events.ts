import { useTimeViewController } from '../context';
import { useCallback, useSyncExternalStore } from 'react';

function useEvents() {
  const controller = useTimeViewController();

  const subscribe = useCallback(
    (listener: () => void) => {
      controller.on('initiated', listener).on('updated', listener);

      return () => {
        controller.off('initiated', listener).off('updated', listener);
      };
    },
    [controller],
  );

  return useSyncExternalStore(
    subscribe,
    () => controller.state.events,
    () => [],
  );
}

export { useEvents };
