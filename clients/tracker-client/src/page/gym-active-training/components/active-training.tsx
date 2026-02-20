import {
  useRepetitionSetBreak,
  useRepetitionSetFact,
  useTrainingFinish,
  useTrainingStart,
} from '@/entity/trainings';
import type { ApiSchemas } from '@/shared/api/types';
import { withLazy } from '@/shared/lib/react/with-lazy';
import { routes } from '@/shared/lib/routes';
import { Button } from '@/shared/ui-kit/ui/button';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { PersonStanding } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useToggle } from 'usehooks-ts';
import { ActiveTrainingController } from '../model/active-training-controller';
import { FinishStep } from './finish-step';
import { WarmUpStep } from './warm-up-step';

const TrainingProgressLazy = withLazy(() =>
  import('./training-progress').then((m) => ({ default: m.TrainingProgress })),
);
const FirstStepLazy = withLazy(() =>
  import('./first-step').then((m) => ({ default: m.FirstStep })),
);
const BreakStepLazy = withLazy(() =>
  import('./break-step').then((m) => ({ default: m.BreakStep })),
);
const RepetitionStepLazy = withLazy(() =>
  import('./repetition-step').then((m) => ({ default: m.RepetitionStep })),
);

interface ActiveTrainingProps {
  readonly training: ApiSchemas['TrainingWithExercisesDto'];
}

function ActiveTraining({ training }: ActiveTrainingProps) {
  const navigate = useNavigate();

  const { 1: forceSync } = useToggle();
  const [trainingController] = useState(() => new ActiveTrainingController(training));

  const { startTraining, isPending: isStartTrainingPending } = useTrainingStart();
  const { finishTraining, isPending: isFinishTrainingPending } = useTrainingFinish();

  const { setFact, isPending: isFactPending } = useRepetitionSetFact();
  const { setBreak, isPending: isBreakPending } = useRepetitionSetBreak();

  return (
    <DataLoader
      blur
      blurContainerClassName="flex grow relative"
      isLoading={
        isFactPending || isBreakPending || isStartTrainingPending || isFinishTrainingPending
      }
    >
      {trainingController.currentStep === 'warm-up' && (
        <WarmUpStep
          duration={(trainingController.activeTraining.wormUpDuration ?? 0) * 60}
          onFinish={() => {
            trainingController.start();
            forceSync();
          }}
        />
      )}

      {trainingController.currentStep === 'start' && (
        <FirstStepLazy
          trainingName={trainingController.activeTraining.name}
          trainingType={trainingController.activeTraining.type}
          onStart={() => {
            startTraining(
              {
                params: { path: { trainingId: trainingController.activeTraining.id } },
              },
              {
                onSuccess: () => {
                  trainingController.start();
                  forceSync();
                },
              },
            );
          }}
        />
      )}

      {['repetition', 'break'].includes(trainingController.currentStep) && (
        <TrainingProgressLazy
          repetitionList={trainingController.repetitions}
          exerciseList={trainingController.exercises}
          trainingName={trainingController.activeTraining.name}
          appendSlot={() => {
            if (trainingController.activeRepetition == null) return null;

            return (
              <div className="my-auto">
                {trainingController.currentStep === 'repetition' ? (
                  <RepetitionStepLazy
                    repetition={trainingController.activeRepetition}
                    renderControls={() => (
                      <WarmUpAction
                        show={trainingController.warmUpAvailable}
                        onClick={() => {
                          trainingController.doWormUp();
                          forceSync();
                        }}
                      />
                    )}
                    canFinish={trainingController.canFinishRepetition}
                    onSuccess={(formData) => {
                      if (trainingController.activeRepetition == null) {
                        toast.error('Нет активного повторения!');
                        return;
                      }

                      const requestData = {
                        id: trainingController.activeRepetition.id,
                        factCount: formData.factCount,
                        finishType: formData.finishType,
                        factWeight: formData.factWeight.toString(),
                      };

                      setFact(
                        {
                          body: { data: requestData },
                          params: {
                            path: {
                              repetitionId: requestData.id,
                              trainingId: trainingController.activeTraining.id,
                            },
                          },
                        },
                        {
                          onSuccess: () => {
                            trainingController.setRepetitionFact({
                              ...requestData,
                              factWeight: +requestData.factWeight,
                            });
                            forceSync();
                          },
                        },
                      );
                    }}
                  />
                ) : (
                  <BreakStepLazy
                    breakDurationSeconds={trainingController.activeRepetition.targetBreak * 60}
                    onBreakEnd={(totalSeconds) => {
                      if (trainingController.activeRepetition == null) return;

                      setBreak(
                        {
                          body: {
                            data: {
                              factBreak: totalSeconds,
                            },
                          },
                          params: {
                            path: {
                              repetitionId: trainingController.activeRepetition.id,
                              trainingId: trainingController.activeTraining.id,
                            },
                          },
                        },
                        {
                          onSuccess: () => {
                            if (trainingController.activeRepetition == null) return;
                            trainingController.setRepetitionDuration(
                              trainingController.activeRepetition.id,
                              totalSeconds,
                            );
                            forceSync();
                          },
                        },
                      );
                    }}
                  />
                )}
              </div>
            );
          }}
        />
      )}

      {trainingController.currentStep === 'finish' && (
        <FinishStep
          onFinish={() =>
            void finishTraining(
              {
                params: { path: { trainingId: trainingController.activeTraining.id } },
              },
              {
                onSuccess: () => {
                  navigate(routes.gymTrainings.path);
                },
              },
            )
          }
        />
      )}
    </DataLoader>
  );
}

function WarmUpAction({ show, onClick }: { show: boolean; onClick: () => void }) {
  if (!show) return null;
  return (
    <Button
      className="rounded-full h-12 w-12 shadow hover:bg-green-500 bg-green-600"
      size="icon"
      type="button"
      onClick={onClick}
    >
      <PersonStanding className="size-6" />
    </Button>
  );
}

export { ActiveTraining, type ActiveTrainingProps };
