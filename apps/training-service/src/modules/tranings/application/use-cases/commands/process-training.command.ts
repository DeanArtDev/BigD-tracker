import { RepetitionFinishType } from '@big-d/api-contracts';
import { FinishRepetitionsUseCase } from '@modules/repetitions/application/use-cases';
import { Inject, Injectable } from '@nestjs/common';
import { TRAININGS_REPOSITORY, TrainingsRepository } from '../../trainings.repository';
import { GetTrainingsWithExercisesQuery } from '../queries/get-trainings-with-exercises.query';

interface StartTrainingInput {
  readonly id: number;
  readonly userId: number;
}

interface SetRepetitionBreakInput {
  readonly userId: number;
  readonly trainingId: number;
  readonly repetitionId: number;
  readonly factBreak: number;
}

interface SetRepetitionFactInput {
  readonly userId: number;
  readonly trainingId: number;
  readonly repetitionId: number;
  readonly factCount: number;
  readonly factWeight: string;
  readonly description?: string;
  readonly finishType: RepetitionFinishType;
}

@Injectable()
class ProcessTrainingCommand {
  constructor(
    @Inject(TRAININGS_REPOSITORY)
    private readonly trainingsRepo: TrainingsRepository,
    private readonly finishRepetitionsService: FinishRepetitionsUseCase,
    private readonly getTrainingsWithExercises: GetTrainingsWithExercisesQuery,
  ) {}

  async start(input: StartTrainingInput): Promise<void> {
    const training = await this.getTrainingsWithExercises.one(input);

    training.startTraining();

    await this.trainingsRepo.update({ id: training.id, in_progress: training.inProgress }, { replace: false });
  }

  async finish(input: StartTrainingInput): Promise<void> {
    const training = await this.getTrainingsWithExercises.one(input);

    training.finishTraining();

    await this.trainingsRepo.update(
      { id: training.id, in_progress: training.inProgress, end_date: training.endDate },
      { replace: false },
    );
  }

  async setRepetitionFact(input: SetRepetitionFactInput): Promise<void> {
    const training = await this.getTrainingsWithExercises.one({
      userId: input.userId,
      id: input.trainingId,
    });
    training.canUpdateRepetitionFact(input.repetitionId);
    await this.finishRepetitionsService.setFact(input);
  }

  async setRepetitionBreak({ repetitionId, factBreak, trainingId, userId }: SetRepetitionBreakInput): Promise<void> {
    const training = await this.getTrainingsWithExercises.one({ id: trainingId, userId });
    training.canUpdateRepetitionBreak(repetitionId);
    await this.finishRepetitionsService.setDuration({ factBreak, repetitionId, userId });
  }
}

export { ProcessTrainingCommand, StartTrainingInput, SetRepetitionFactInput, SetRepetitionBreakInput };
