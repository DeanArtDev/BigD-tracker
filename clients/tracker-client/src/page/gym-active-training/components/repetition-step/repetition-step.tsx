import { useIsMobile } from '@/shared/ui-kit/hooks/use-mobile';
import { Button } from '@/shared/ui-kit/ui/button';
import { debounce } from 'lodash-es';
import { toast } from 'sonner';
import { RepetitionFactDialog, type RepetitionFactFormProps } from '../repetition-fact-form';
import { RepetitionStopwatch } from './repetition-stopwatch';

interface RepetitionStepProps extends RepetitionFactFormProps {
  readonly canFinish: (totalSeconds: number) => boolean;
}

function RepetitionStep({ repetition, onSuccess, canFinish }: RepetitionStepProps) {
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
                <Button
                  className="rounded-full mt-10 min-h-[60px] shadow text-3xl hover:bg-green-500 bg-green-600"
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
              );
            }}
          />
        );
      }}
    />
  );
}

export { RepetitionStep, type RepetitionStepProps };
