import { CountdownStopwatch } from '@/shared/components/dial';
import { Button } from '@/shared/ui-kit/ui/button';

interface BreakStepProps {
  readonly breakDurationSeconds: number;
  readonly onBreakEnd: (totalSeconds: number) => void;
}

function BreakStep({ breakDurationSeconds, onBreakEnd }: BreakStepProps) {
  return (
    <CountdownStopwatch
      targetSeconds={breakDurationSeconds}
      autoStart
      renderControls={({ totalSeconds }) => {
        return (
          <Button
            className="rounded-full mt-10 min-h-[60px] shadow text-3xl hover:bg-green-500 bg-green-600"
            onClick={() => {
              onBreakEnd(totalSeconds.target + totalSeconds.expired);
            }}
          >
            Продолжим
          </Button>
        );
      }}
    />
  );
}

export { BreakStep, type BreakStepProps };
