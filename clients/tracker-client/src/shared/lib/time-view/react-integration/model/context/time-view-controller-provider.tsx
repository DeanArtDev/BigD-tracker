import { TimeViewController, type TimeViewControllerOptions } from '@/shared/lib/time-view/core';
import type { DeepPartial } from '@/shared/lib/type-helpers';
import { type PropsWithChildren, useEffect, useRef } from 'react';
import { timeViewControllerContext } from './context';

interface TimeViewControllerProviderProps {
  readonly options?: DeepPartial<TimeViewControllerOptions>;
}

function TimeViewControllerProvider<TExtra = any>({
  children,
  options,
}: PropsWithChildren<TimeViewControllerProviderProps>) {
  const controllerRef = useRef<TimeViewController<TExtra>>(new TimeViewController<TExtra>(options));

  const controller = controllerRef.current;

  useEffect(() => {
    controller.init();
    return controller.destroy;
  }, []);

  return <timeViewControllerContext.Provider value={controller}>{children}</timeViewControllerContext.Provider>;
}

export { TimeViewControllerProvider, type TimeViewControllerProviderProps };
