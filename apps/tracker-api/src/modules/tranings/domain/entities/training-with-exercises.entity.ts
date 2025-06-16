import {
  ExerciseType,
  ExerciseWithRepetitionsEntity,
  UpdateExerciseRepetitionsInput,
} from '@/modules/exercises';
import { Validator } from '@shared/lib/validator';
import { TrainingEntity, TrainingEntityData } from './training.entity';

const validator = new Validator('trainings-with-exercises');

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
      id: training.id ?? Infinity,
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

  protected constructor(protected readonly data: TrainingWithExercisesEntityData) {
    super(data);
  }

  setExercises(exercises: ExerciseWithRepetitionsEntity[]): this {
    this.data.exercises = exercises;
    this.validate();
    return this;
  }

  updateExercises(input: UpdateExerciseInput): this {
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

    for (const exercise of this.data.exercises) {
      const newData = indexMap.get(exercise.id);
      if (indexMap.has(exercise.id) && newData != null) {
        exercise
          .update({
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

  get exercises() {
    return [...this.data.exercises];
  }
}

export { TrainingWithExercisesEntity };
