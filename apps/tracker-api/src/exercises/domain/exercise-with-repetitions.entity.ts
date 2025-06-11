import { RepetitionEntity } from '@/repetitions';
import { Validator } from '@shared/lib/validator';
import { ExerciseData, ExerciseEntity } from './exercise.entity';

const validator = new Validator('exercises-with-repetitions');

interface ExerciseWithRepetitionsData extends ExerciseData {
  repetitions: RepetitionEntity[];
}

class ExerciseWithRepetitionsEntity extends ExerciseEntity {
  static create(
    data: Parameters<typeof ExerciseEntity.create>[0] & { repetitions: RepetitionEntity[] },
  ): ExerciseWithRepetitionsEntity {
    return new ExerciseWithRepetitionsEntity({
      id: Infinity,
      ...data,
    });
  }

  static restore(data: ExerciseWithRepetitionsData): ExerciseWithRepetitionsEntity {
    return new ExerciseWithRepetitionsEntity({
      id: data.id,
      type: data.type,
      name: data.name,
      description: data.description,
      exampleUrl: data.exampleUrl,
      userId: data.userId,
      repetitions: data.repetitions.map(RepetitionEntity.restore),
    });
  }

  private constructor(protected readonly data: ExerciseWithRepetitionsData) {
    const { repetitions, ...base } = data;
    super(base);

    if (repetitions.some((i) => i.exerciseId !== this.id)) {
      validator.throwError(`Repetitions must belong to exercise {id: ${this.id}}`, 'repetitions');
    }
    this.data.repetitions = repetitions;
  }

  replaceRepetitions(repetitions: RepetitionEntity[]): this {
    if (repetitions.some((i) => i.exerciseId !== this.id)) {
      validator.throwError(`Repetitions must belong to exercise {id: ${this.id}}`, 'repetitions');
    }

    const LIMIT = 20;
    if (repetitions.length + this.repetitions.length > LIMIT) {
      validator.throwError(
        `There are to much repetitions for exercise {id: ${this.id}} limit is ${LIMIT}`,
        'repetitions',
      );
    }

    this.data.repetitions = repetitions;
    return this;
  }

  get repetitions() {
    return this.data.repetitions;
  }
}

export { ExerciseWithRepetitionsEntity };
