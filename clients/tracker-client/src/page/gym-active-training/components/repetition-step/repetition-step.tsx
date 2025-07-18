import { useIsMobile } from '@/shared/ui-kit/helpers/use-mobile';
import { Button } from '@/shared/ui-kit/ui/button';
import { debounce } from 'lodash-es';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { RepetitionFactDialog, type RepetitionFactFormProps } from '../repetition-fact-form';
import { RepetitionStopwatch } from './repetition-stopwatch';

interface RepetitionStepProps extends RepetitionFactFormProps {
  readonly canFinish: (totalSeconds: number) => boolean;
  readonly renderControls?: () => ReactNode;
}

function RepetitionStep({ repetition, onSuccess, canFinish, renderControls }: RepetitionStepProps) {
  const isMobile = useIsMobile();

  return (
    <RepetitionStopwatch
      renderControls={({ totalSeconds, pause }) => {
        return (
          <RepetitionFactDialog
            repetition={{
              targetBreak: repetition.targetBreak,
              targetCount: repetition.targetCount,
              targetWeight: repetition.targetWeight,
            }}
            onSuccess={onSuccess}
            childRender={({ open }) => {
              const debouncedToast = debounce(
                toast.bind(null, 'И 10 секунд не прошло, ты точно выполнил подход??', {
                  action: {
                    label: 'Да',
                    onClick: open,
                  },
                  position: isMobile ? 'bottom-center' : 'top-center',
                  duration: 5000,
                  dismissible: true,
                }),
                1000,
                { leading: true, trailing: false },
              );

              return (
                <div className="flex gap-4 mt-10 max-h-[60px]">
                  <Button
                    className="rounded-full h-auto shadow text-3xl hover:bg-green-500 bg-green-600"
                    onClick={() => {
                      pause();
                      if (!canFinish(totalSeconds)) {
                        debouncedToast();
                        return;
                      }
                      open();
                    }}
                  >
                    Готово!
                  </Button>
                  {renderControls?.()}
                </div>
              );
            }}
          />
        );
      }}
    />
  );
}

export { RepetitionStep, type RepetitionStepProps };
