import { useTimeViewController } from '../context';
import { useCallback, useMemo, useSyncExternalStore } from 'react';

function useSelectedDateState() {
  const controller = useTimeViewController();

  const subscribe = useCallback(
    (listener: () => void) => {
      controller.on('initiated', listener).on('updated', listener);
      return () => void controller.off('initiated', listener).off('updated', listener);
    },
    [controller],
  );

  const dateSet = useMemo(() => {
    return controller.getFromAndTo(controller.state.selectedDate);
  }, [controller.state.selectedDate]);

  const isToday =
    controller.state.selectedDate.get('date') === controller.state.currentTime().get('date');

  return {
    isToday,
    dateSet,
    selectedDate: useSyncExternalStore(subscribe, () => controller.state.selectedDate),
  };
}

export { useSelectedDateState };
