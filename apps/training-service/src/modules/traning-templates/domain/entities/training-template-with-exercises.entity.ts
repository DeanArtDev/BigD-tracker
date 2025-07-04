import { RepetitionEntity } from '@/modules/repetitions';
import { ExerciseType } from '@big-d/api-contracts';
import { TrainingTemplateEntity, TrainingTemplateEntityData } from './training-template.entity';
import { DomainValidator } from '@big-d/api-utils';
import {
  ExerciseWithRepetitionsEntity,
  UpdateExerciseRepetitionsInput,
} from '@/modules/exercises/domain';

const validator = new DomainValidator('training-templates-with-exercises');

type TrainingWithExercisesEntityData = TrainingTemplateEntityData & {
  exercises: ExerciseWithRepetitionsEntity[];
};

type UpdateTemplateExerciseInput = {
  readonly id: number;
  readonly position: number;
  name: string;
  type: ExerciseType;
  description?: string;
  exampleUrl?: string;
  repetitions: UpdateExerciseRepetitionsInput;
}[];

class TrainingTemplateWithExercisesEntity extends TrainingTemplateEntity {
  static create = (
    data: Parameters<typeof TrainingTemplateEntity.create>[0],
  ): TrainingTemplateWithExercisesEntity => {
    const training = TrainingTemplateEntity.create(data);

    return new TrainingTemplateWithExercisesEntity({
      id: training.id,
      type: training.type,
      name: training.name,
      wormUpDuration: training.wormUpDuration,
      postTrainingDuration: training.postTrainingDuration,
      userId: training.userId,
      description: training.description,
      exercises: [],
    });
  };

  static restore = (
    data: Omit<TrainingWithExercisesEntityData, 'exercises'>,
  ): TrainingTemplateWithExercisesEntity => {
    const training = TrainingTemplateEntity.restore(data);
    return new TrainingTemplateWithExercisesEntity({
      id: training.id,
      type: training.type,
      name: training.name,
      wormUpDuration: training.wormUpDuration,
      postTrainingDuration: training.postTrainingDuration,
      userId: training.userId,
      description: training.description,
      exercises: [],
    });
  };

  protected constructor(protected readonly data: TrainingWithExercisesEntityData) {
    super(data);
  }

  setExercises(exercises: ExerciseWithRepetitionsEntity[]): this {
    this.data.exercises = exercises;
    validator.isIntGt(this.exercises.length, 1, 'exercises');
    this.validate();
    return this;
  }

  public updateExercises(input: UpdateTemplateExerciseInput): this {
    const indexMap = new Map<number, ExerciseWithRepetitionsEntity>();
    for (const exercise of this.data.exercises) {
      indexMap.set(exercise.id, exercise);
    }

    const buffer: ExerciseWithRepetitionsEntity[] = [];

    for (let i = 0; i < input.length; i++) {
      const exercise = input[i];
      const prevExercise = indexMap.get(exercise.id);

      if (prevExercise != null) {
        buffer.push(
          prevExercise
            .update({
              position: i,
              type: prevExercise.type,
              name: prevExercise.name,
              description: prevExercise.description,
              exampleUrl: prevExercise.exampleUrl,
            })
            .assignToTemplate({ trainingTemplateId: this.id })
            .updateRepetitions(
              exercise.repetitions.map((rep) => ({
                id: rep.id,
                description: rep.description,
                targetBreak: rep.targetBreak,
                targetWeight: rep.targetWeight,
                targetCount: rep.targetCount,
              })),
            ),
        );
      } else {
        const newExercise = ExerciseWithRepetitionsEntity.create({
          ...exercise,
          position: i,
        }).assignToTemplate({
          trainingTemplateId: this.id,
        });

        buffer.push(
          newExercise.setRepetitions(
            exercise.repetitions.map((rep, index) =>
              RepetitionEntity.create({ ...rep, exerciseId: newExercise.id, position: index }),
            ),
          ),
        );
      }
    }

    this.setExercises(buffer);
    return this;
  }

  public validate(): this {
    super.validate();

    if (this.data.exercises.some((i) => i.trainingTemplateId !== this.id)) {
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

  get exercises() {
    return [...this.data.exercises];
  }
}

export { TrainingTemplateWithExercisesEntity };
