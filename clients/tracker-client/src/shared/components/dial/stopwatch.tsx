import { type ReactNode, useEffect, useState } from 'react';
import { useStopwatch } from 'react-timer-hook';
import { DialView } from './dial-view';

type RenderControlsData = Pick<
  ReturnType<typeof useStopwatch>,
  'start' | 'pause' | 'isRunning' | 'totalSeconds' | 'reset'
>;

type RenderContentData = Pick<
  ReturnType<typeof useStopwatch>,
  'hours' | 'minutes' | 'seconds' | 'milliseconds' | 'days' | 'totalSeconds' | 'start' | 'pause' | 'reset' | 'isRunning'
>;

interface StopwatchProps {
  readonly targetSeconds?: number;
  readonly interval?: number;
  readonly autoStart?: boolean;
  readonly renderControls?: (renderData: RenderControlsData) => ReactNode;
  readonly renderContent?: (renderData: RenderContentData) => ReactNode;
}

function Stopwatch({
  targetSeconds = 300,
  autoStart = false,
  interval,
  renderControls,
  renderContent,
}: StopwatchProps) {
  const { seconds, minutes, isRunning, totalSeconds, hours, days, milliseconds, start, pause, reset } = useStopwatch({
    autoStart,
    interval,
  });

  const TOTAL_SECONDS = targetSeconds;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const elapsed = minutes * 60 + seconds;
    const clamped = Math.min(elapsed, TOTAL_SECONDS);
    const percentage = clamped / TOTAL_SECONDS;
    setProgress(percentage * 100);
  }, [seconds, minutes, TOTAL_SECONDS]);

  const progressColor = totalSeconds > targetSeconds ? 'var(--destructive)' : 'var(--color-primary)';

  return (
    <DialView
      progressColor={progressColor}
      progress={progress}
      afterSlot={renderControls?.({ start, pause, isRunning, totalSeconds, reset })}
      contentSlot={renderContent?.({
        days,
        totalSeconds,
        hours,
        milliseconds,
        minutes,
        seconds,
        isRunning,
        start,
        pause,
        reset,
      })}
    />
  );
}

export { Stopwatch, type StopwatchProps, type RenderContentData, type RenderControlsData };
