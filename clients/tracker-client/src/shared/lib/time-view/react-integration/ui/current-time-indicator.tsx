import { useForceRender } from '@/shared/lib/react/use-force-render';
import { useInterval } from 'usehooks-ts';
import { useTimeViewController } from '../model';
import { useCurrentTimeState } from '../model/selectors';

function CurrentTimeIndicator() {
  const controller = useTimeViewController();

  const { forceRender } = useForceRender();
  useInterval(forceRender, 1000 * 5);

  const { top, right, left, bottom } = controller.calculateTimeIndicator();
  const currentTime = useCurrentTimeState();

  return (
    <div
      className="absolute h-[2px] bg-red-400/50 rounded-lg z-1"
      style={{ left, right, top, bottom }}
    >
      <div className="relative text-sm text-center w-[50px] top-[-8px] bg-red-400 rounded-md">
        {currentTime().format('HH:mm')}
      </div>
    </div>
  );
}

export { CurrentTimeIndicator };
