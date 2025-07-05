import { type JSX, useState } from 'react';
import { useStopwatch, useTimer } from 'react-timer-hook';
import { DialView } from './dial-view';

type RenderData = Pick<ReturnType<typeof useTimer>, 'start' | 'restart' | 'pause' | 'isRunning'> & {
  readonly totalSeconds: {
    readonly target: number;
    readonly expired: number;
  };
};

interface CountdownStopwatchProps {
  readonly autoStart?: boolean;
  readonly targetSeconds: number;
  readonly renderControls?: (renderData: RenderData) => JSX.Element;
}

function CountdownStopwatch({
  autoStart = false,
  targetSeconds,
  renderControls,
}: CountdownStopwatchProps) {
  const [isExpired, setIsExpired] = useState(false);

  const expiryTimestamp = new Date();
  expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + targetSeconds);

  const stopwatch = useStopwatch({
    autoStart: false,
  });

  const { seconds, minutes, isRunning, start, pause, totalSeconds, restart } = useTimer({
    expiryTimestamp,
    autoStart,
    onExpire: () => {
      setIsExpired(true);
      stopwatch.start();
    },
  });

  const remainingSeconds = minutes * 60 + seconds;
  const progress = ((targetSeconds - remainingSeconds) / targetSeconds) * 100;

  const progressColor = progress >= 100 ? 'var(--destructive)' : 'var(--color-primary)';

  return (
    <DialView
      progress={progress}
      progressColor={progressColor}
      afterSlot={renderControls?.({
        start,
        pause: () => {
          return isExpired ? stopwatch.pause : pause;
        },
        isRunning,
        totalSeconds: {
          target: targetSeconds - totalSeconds,
          expired: stopwatch.totalSeconds,
        },
        restart: () => {
          setIsExpired(false);
          return restart;
        },
      })}
      contentSlot={
        <>
          {String(isExpired ? stopwatch.minutes : minutes).padStart(2, '0')}:
          {String(isExpired ? stopwatch.seconds : seconds).padStart(2, '0')}
        </>
      }
    />
  );
}

export { CountdownStopwatch, type CountdownStopwatchProps };
