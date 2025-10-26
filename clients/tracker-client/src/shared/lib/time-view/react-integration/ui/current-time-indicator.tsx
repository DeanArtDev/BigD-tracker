import { useForceRender } from '@/shared/lib/react/use-force-render';
import type { PropsWithChildren } from 'react';
import { useInterval } from 'usehooks-ts';
import { useTimeViewController } from '../model';
import { useCurrentTime } from '../model/selectors';

interface CurrentTimeIndicatorProps {
  readonly container: { width: number; height: number };
}

function CurrentTimeIndicator({ container }: PropsWithChildren<CurrentTimeIndicatorProps>) {
  const controller = useTimeViewController();

  const { forceRender } = useForceRender();
  useInterval(forceRender, 1000 * 5);

  const { y } = controller.calculateCurrentTimePosition(container);
  const currentTime = useCurrentTime();

  return (
    <div
      className="absolute h-[4px] bg-red-400 rounded-lg z-1"
      style={{ left: 0, right: 0, top: y }}
    >
      <div className="relative text-sm text-center w-[50px] top-[-8px] bg-red-400 rounded-md">
        {currentTime().format('HH:mm')}
      </div>
    </div>
  );
}

export { CurrentTimeIndicator, type CurrentTimeIndicatorProps };
