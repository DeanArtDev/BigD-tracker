import {
  useRepetitionSetBreak,
  useRepetitionSetFact,
  useTrainingFinish,
  useTrainingStart,
} from '@/entity/trainings';
import { routes } from '@/shared/lib/routes';
import { useNavigate } from 'react-router-dom';
import { FinishStep } from './finish-step';
import type { ApiDto } from '@/shared/api/types';
import { withLazy } from '@/shared/lib/react/with-lazy';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { useState } from 'react';
import { toast } from 'sonner';
import { useToggle } from 'usehooks-ts';
import { ActiveTrainingController } from '../model/active-training-controller';

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
  readonly training: ApiDto['TrainingWithExercisesDto'];
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

export { ActiveTraining, type ActiveTrainingProps };
