import { RepetitionEntity } from '@/modules/repetitions';
import { Validator } from '@shared/lib/validator';
import { ExerciseData, ExerciseEntity } from './exercise.entity';

const validator = new Validator('exercises-with-repetitions');

interface ExerciseWithRepetitionsData extends ExerciseData {
  repetitions: RepetitionEntity[];
}

type UpdateExerciseRepetitionsInput = {
  id: number;
  targetCount: number;
  targetWeight: string;
  targetBreak: number;
  description?: string;
}[];

class ExerciseWithRepetitionsEntity extends ExerciseEntity {
  static create = (
    data: Parameters<typeof ExerciseEntity.create>[0],
  ): ExerciseWithRepetitionsEntity => {
    const exercise = ExerciseEntity.create(data);
    return new ExerciseWithRepetitionsEntity({
      id: exercise.id ?? Infinity,
      type: exercise.type,
      name: exercise.name,
      description: exercise.description,
      exampleUrl: exercise.exampleUrl,
      userId: exercise.userId,
      trainingId: exercise.trainingId,
      trainingTemplateId: exercise.trainingTemplateId,
      repetitions: [],
    });
  };

  static restore = (
    data: Omit<ExerciseWithRepetitionsData, 'repetitions'>,
  ): ExerciseWithRepetitionsEntity => {
    const exercise = ExerciseEntity.restore(data);
    return new ExerciseWithRepetitionsEntity({
      id: exercise.id,
      type: exercise.type,
      name: exercise.name,
      description: exercise.description,
      exampleUrl: exercise.exampleUrl,
      userId: exercise.userId,
      trainingId: exercise.trainingId,
      trainingTemplateId: exercise.trainingTemplateId,
      repetitions: [],
    });
  };

  private constructor(protected readonly data: ExerciseWithRepetitionsData) {
    super(data);
    this.validate();
  }

  public setRepetitions(repetitions: RepetitionEntity[]): this {
    this.data.repetitions = repetitions;
    this.validate();
    return this;
  }

  public updateRepetitions(input: UpdateExerciseRepetitionsInput): this {
    const indexMap = new Map<number, UpdateExerciseRepetitionsInput[0]>();
    for (const rep of input) {
      if (indexMap.has(rep.id)) {
        validator.throwError(
          `There are duplicated repetition ids ${input.map((i) => i.id).join(', ')}`,
          'repetitions',
        );
      }

      indexMap.set(rep.id, rep);
    }

    for (const repetition of this.data.repetitions) {
      const newData = indexMap.get(repetition.id);
      if (indexMap.has(repetition.id) && newData != null) {
        repetition
          .updateTargets({
            targetCount: newData.targetCount,
            targetWeight: newData.targetWeight,
            targetBreak: newData.targetBreak,
          })
          .updateDescription(newData.description);
      }
    }

    this.validate();
    return this;
  }

  public validate() {
    super.validate();

    const LIMIT = 20;
    if (this.data.repetitions.length > LIMIT) {
      validator.throwError(
        `There are to much repetitions for exercise {id: ${this.id}} limit is ${LIMIT}`,
        'repetitions',
      );
    }

    if (this.data.repetitions.some((i) => i.exerciseId !== this.id)) {
      validator.throwError(`Repetitions must belong to exercise {id: ${this.id}}`, 'repetitions');
    }

    for (const repetition of this.data.repetitions) {
      repetition.validate();
    }

    return this;
  }

  get repetitions() {
    return [...this.data.repetitions];
  }
}

export { ExerciseWithRepetitionsEntity, UpdateExerciseRepetitionsInput };
