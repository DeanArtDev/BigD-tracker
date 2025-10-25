import {
  type TimeLineEvent,
  TimeViewController,
  type TimeViewControllerOptions,
} from '@/shared/lib/time-view/core';
import type { DeepPartial } from '@/shared/lib/type-helpers';
import { type PropsWithChildren, useEffect, useRef } from 'react';
import { timeViewControllerContext } from './context';

interface TimeViewControllerProviderProps<TExtra = any> {
  readonly events: TimeLineEvent<TExtra>[];
  readonly options?: DeepPartial<TimeViewControllerOptions>;
}

function TimeViewControllerProvider<TExtra = any>({
  events,
  children,
  options,
}: PropsWithChildren<TimeViewControllerProviderProps<TExtra>>) {
  const controllerRef = useRef<TimeViewController<TExtra>>(new TimeViewController<TExtra>(options));

  const controller = controllerRef.current;

  useEffect(() => {
    controller.init();
    return controller.destroy;
  }, []);

  useEffect(() => {
    if (controller != null) {
      controller.setEvents(events);
    }
  }, [events, controller]);

  return (
    <timeViewControllerContext.Provider value={controller}>
      {children}
    </timeViewControllerContext.Provider>
  );
}

export { TimeViewControllerProvider, type TimeViewControllerProviderProps };
