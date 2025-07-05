import { RepetitionEntity } from '@/modules/repetitions';
import { ExerciseType } from '@big-d/api-contracts';
import { TrainingEntity, TrainingEntityData } from './training.entity';
import { DomainValidator } from '@big-d/api-utils';
import {
  ExerciseWithRepetitionsEntity,
  UpdateExerciseRepetitionsInput,
} from '@/modules/exercises/domain';

const validator = new DomainValidator('trainings-with-exercises');

type TrainingWithExercisesEntityData = TrainingEntityData & {
  exercises: ExerciseWithRepetitionsEntity[];
};

type UpdateExerciseInput = {
  readonly id: number;
  name: string;
  type: ExerciseType;
  description?: string;
  exampleUrl?: string;
  repetitions: UpdateExerciseRepetitionsInput;
}[];

class TrainingWithExercisesEntity extends TrainingEntity {
  static create = (
    data: Parameters<typeof TrainingEntity.create>[0],
  ): TrainingWithExercisesEntity => {
    const training = TrainingEntity.create(data);

    return new TrainingWithExercisesEntity({
      id: training.id,
      type: training.type,
      name: training.name,
      inProgress: training.inProgress,
      wormUpDuration: training.wormUpDuration,
      postTrainingDuration: training.postTrainingDuration,
      endDate: training.endDate,
      userId: training.userId,
      startDate: training.startDate,
      description: training.description,
      exercises: [],
    });
  };

  static restore = (
    data: Omit<TrainingWithExercisesEntityData, 'exercises'>,
  ): TrainingWithExercisesEntity => {
    const training = TrainingEntity.restore(data);
    return new TrainingWithExercisesEntity({
      id: training.id,
      type: training.type,
      name: training.name,
      inProgress: training.inProgress,
      wormUpDuration: training.wormUpDuration,
      postTrainingDuration: training.postTrainingDuration,
      endDate: training.endDate,
      userId: training.userId,
      startDate: training.startDate,
      description: training.description,
      exercises: [],
    });
  };

  get exercises() {
    return [...this.data.exercises];
  }

  protected constructor(protected readonly data: TrainingWithExercisesEntityData) {
    super(data);
  }

  public setExercises(exercises: ExerciseWithRepetitionsEntity[]): this {
    this.data.exercises = exercises;
    validator.isIntGt(this.exercises.length, 1, 'exercises');
    this.validate();
    return this;
  }

  public updateExercises(input: UpdateExerciseInput): this {
    const indexMap = new Map<number, UpdateExerciseInput[0]>();
    for (const rep of input) {
      if (indexMap.has(rep.id)) {
        validator.throwError(
          `There are duplicated exercise ids ${input.map((i) => i.id).join(', ')}`,
          'exercises',
        );
      }
      indexMap.set(rep.id, rep);
    }

    for (let i = 0; i < this.data.exercises.length; i++) {
      const exercise = this.data.exercises[i];
      const newData = indexMap.get(exercise.id);
      if (indexMap.has(exercise.id) && newData != null) {
        exercise
          .update({
            position: i,
            type: newData.type,
            name: newData.name,
            description: newData.description,
            exampleUrl: newData.exampleUrl,
          })
          .updateRepetitions(newData.repetitions);
      }
    }

    this.validate();
    return this;
  }

  public validate(): this {
    super.validate();

    if (this.data.exercises.some((i) => i.trainingId !== this.id)) {
      validator.throwError(`Exercises must belong to training {id: ${this.id}}`, 'exercises');
    }

    if (
      new Set(this.data.exercises.map((item) => item.position)).size !== this.data.exercises.length
    ) {
      validator.throwError(`Exercises must not have position duplicates`, 'exercises');
    }

    const LIMIT = 10;
    if (this.data.exercises.length > LIMIT) {
      validator.throwError(
        `There are to much exercises for training {id: ${this.id}} limit is ${LIMIT}`,
        'exercises',
      );
    }

    for (const exercise of this.data.exercises) {
      exercise.validate();
    }

    return this;
  }

  public startTraining() {
    super.start();

    for (const exercises of this.data.exercises) {
      if (!exercises.canStart(this.data.id)) return false;
    }
  }

  public finishTraining() {
    super.finish();

    for (const exercises of this.data.exercises) {
      if (!exercises.canFinish(this.data.id)) return false;
    }
  }

  public canUpdateRepetitionFact(repetitionId: number): boolean {
    if (!this.inProgress) {
      validator.throwError(
        `Training: ${this.data.id} has not started yet`,
        'canUpdateRepetitionFact',
      );
    }

    this.#allRepetitionsAccordanceToTrainingFlow(repetitionId, 'canUpdateRepetitionFact');

    return true;
  }

  public canUpdateRepetitionBreak(repetitionId: number): boolean {
    if (!this.inProgress) {
      validator.throwError(
        `Training: ${this.data.id} has not started yet`,
        'canUpdateRepetitionBreak',
      );
    }

    this.#allRepetitionsAccordanceToTrainingFlow(repetitionId, 'canUpdateRepetitionBreak');

    for (const exercise of this.data.exercises) {
      for (const rep of exercise.repetitions) {
        if (rep.id === repetitionId) {
          return exercise.canUpdateRepetitionBreak(repetitionId);
        }
      }
    }

    return false;
  }

  #allRepetitionsAccordanceToTrainingFlow(repetitionId: number, field: string) {
    const buffer: RepetitionEntity[] = [];
    for (const exercises of this.data.exercises) {
      buffer.push(...exercises.repetitions);
    }

    const index = buffer.findIndex((i) => i.id === repetitionId);
    if (index === -1) {
      validator.throwError(
        `Training: ${this.data.id} doesn't nave a repetition: ${repetitionId}`,
        field,
      );
    }

    let left = index - 1;
    let right = index + 1;
    while (left !== 0 && right !== buffer.length - 1) {
      const leftStatus = buffer[left]?.status;
      const rightStatus = buffer[right]?.status;

      if (leftStatus != null && leftStatus !== 'done') {
        validator.throwError('All previous repetition have not done yet', field);
      }

      if (rightStatus != null && rightStatus !== 'inactive') {
        validator.throwError(`All next repetition have not had 'inactive' status`, field);
      }

      left = left <= 0 ? 0 : --left;
      right = right >= buffer.length - 1 ? buffer.length - 1 : ++right;
    }
  }
}

export { TrainingWithExercisesEntity };
