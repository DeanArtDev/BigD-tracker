import type { RenderControlsData } from '@/shared/components/dial';
import { Stopwatch } from '@/shared/components/dial';
import { Play } from 'lucide-react';
import type { ReactNode } from 'react';

interface RepetitionStopwatchProps {
  readonly renderControls?: (renderData: RenderControlsData) => ReactNode;
}

function RepetitionStopwatch({ renderControls }: RepetitionStopwatchProps) {
  return (
    <Stopwatch
      renderControls={renderControls}
      renderContent={({ minutes, seconds, pause, start, isRunning }) => (
        <button className="text-[length:inherit] cursor-pointer" onClick={() => void (isRunning ? pause() : start())}>
          {isRunning ? (
            <span>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          ) : (
            <Play className="size-18" color="var(--color-primary)" />
          )}
        </button>
      )}
    />
  );
}

export { RepetitionStopwatch, type RepetitionStopwatchProps };
