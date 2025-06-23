import { UpdateExercisesWithRepetitionsCommand } from '@/modules/exercises';
import { FinishRepetitionsService, RepetitionFinishType } from '@/modules/repetitions';
import { Inject, Injectable } from '@nestjs/common';
import { KyselyUnitOfWork } from '@shared/core/uow';
import { TRAININGS_REPOSITORY, TrainingsRepository } from '../../../trainings.repository';
import { GetTrainingsWithExercisesQuery } from '../../queries/get-trainings-with-exercises.query';
import { GetTrainingsQuery } from '../../queries/get-trainings.query';

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
    private readonly getTrainingsQuery: GetTrainingsQuery,

    private readonly finishRepetitionsService: FinishRepetitionsService,

    private readonly getTrainingsWithExercises: GetTrainingsWithExercisesQuery,
    private readonly updateExercisesWithRepetitions: UpdateExercisesWithRepetitionsCommand,

    private readonly unitOfWork: KyselyUnitOfWork,
  ) {}

  async start(input: StartTrainingInput): Promise<void> {
    const training = await this.getTrainingsWithExercises.one(input);

    training.startTraining();

    await this.trainingsRepo.update(
      { id: training.id, in_progress: training.inProgress },
      { replace: false },
    );
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
    await this.unitOfWork.execute(async (transaction) => {
      const training = await this.getTrainingsWithExercises.one(
        {
          userId: input.userId,
          id: input.trainingId,
        },
        transaction,
      );

      training.canUpdateRepetitionFact(input.repetitionId);

      await this.finishRepetitionsService.setFact(input, transaction);
    });
  }

  async setRepetitionBreak({
    repetitionId,
    factBreak,
    trainingId,
    userId,
  }: SetRepetitionBreakInput): Promise<void> {
    await this.unitOfWork.execute(async (transaction) => {
      const training = await this.getTrainingsWithExercises.one(
        { id: trainingId, userId },
        transaction,
      );

      training.canUpdateRepetitionBreak(repetitionId);

      await this.finishRepetitionsService.setDuration(
        { factBreak, repetitionId, userId },
        transaction,
      );
    });
  }
}

export {
  ProcessTrainingCommand,
  StartTrainingInput,
  SetRepetitionFactInput,
  SetRepetitionBreakInput,
};
