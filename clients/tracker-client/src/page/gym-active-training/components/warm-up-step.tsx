import { AlertConfirmDialog } from '@/shared/components/alert-confirm-dialog';
import { CountdownStopwatch } from '@/shared/components/dial';
import { Button } from '@/shared/ui-kit/ui/button';

interface WarmUpStepProps {
  readonly duration: number;
  readonly onFinish: (totalSeconds: { readonly target: number; readonly expired: number }) => void;
}

function WarmUpStep({ duration, onFinish }: WarmUpStepProps) {
  return (
    <div className="flex flex-col gap-10 m-auto">
      <h3 className="px-2 mb-4 text-4xl font-bold leading-4 text-center">Разминка</h3>
      <CountdownStopwatch
        targetSeconds={duration}
        autoStart
        renderControls={({ totalSeconds }) => {
          return (
            <AlertConfirmDialog
              skip={totalSeconds.expired > 0}
              title="Отмена"
              content="Разминка еще не закончика, уверен что хочешь прервать?"
              onConfirm={() => void onFinish(totalSeconds)}
            >
              <Button className="rounded-full mt-10 h-auto shadow text-3xl hover:bg-green-500 bg-green-600">
                Размялся!
              </Button>
            </AlertConfirmDialog>
          );
        }}
      />
    </div>
  );
}

export { WarmUpStep, type WarmUpStepProps };
