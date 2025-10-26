import { useTimeViewController } from '../context';
import { useCallback, useSyncExternalStore } from 'react';

function useSelectedDate() {
  const controller = useTimeViewController();

  const subscribe = useCallback(
    (listener: () => void) => {
      controller.on('initiated', listener).on('updated', listener);
      return () => void controller.off('initiated', listener).off('updated', listener);
    },
    [controller],
  );

  const isToday =
    controller.state.selectedDate.get('date') === controller.state.currentTime().get('date');

  return {
    isToday,
    selectedDate: useSyncExternalStore(subscribe, () => controller.state.selectedDate),
  };
}

export { useSelectedDate };
