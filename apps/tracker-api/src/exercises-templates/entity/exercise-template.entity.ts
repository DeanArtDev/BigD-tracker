import { RepetitionEntity } from '@/repetitions/repetitions.entity';
import { Validator } from '@shared/lib/validator';

const validator = new Validator('exercises-templates');

enum ExerciseType {
  'WORM-UP' = 'WORM-UP',
  'POST-TRAINING' = 'POST-TRAINING',
  'AEROBIC' = 'AEROBIC',
  'ANAEROBIC' = 'ANAEROBIC',
}

interface ExerciseTemplateData {
  readonly id: number;
  userId?: number;
  name: string;
  type: ExerciseType;
  createdAt: string;
  updatedAt: string;
  description?: string;
  exampleUrl?: string;
}

class ExerciseTemplateEntity {
  #repetitions: RepetitionEntity[];

  constructor(private readonly data: ExerciseTemplateData) {
    const { id, userId, description, name, type, exampleUrl, createdAt, updatedAt } = data;

    if (exampleUrl != null) {
      validator.isUrl(exampleUrl, 'exampleUrl');
    }

    if (description != null) {
      validator.isNotStringEmpty(description, 'description');
    }

    if (userId != null) {
      validator.isIdValId(userId, 'userId');
    }

    validator.isIdValId(id, 'id');
    validator.isNotStringEmpty(name, 'name');
    validator.isEnum(type, ExerciseType, 'type');
    validator.isDateISO(createdAt, 'createdAt');
    validator.isDateISO(updatedAt, 'updatedAt');
  }

  public addRepetitions(data: RepetitionEntity[]) {
    if (data.some((i) => i.exerciseId !== this.id)) {
      validator.throwError(`Repetitions must belong to exercise {id: ${this.id}}`, 'repetitions');
    }

    const LIMIT = 20;
    if (data.length > LIMIT) {
      validator.throwError(
        `There are to much repetitions for exercise {id: ${this.id}} limit is ${LIMIT}`,
        'repetitions',
      );
    }

    this.#repetitions = data;
    return this;
  }

  get id() {
    return this.data.id;
  }
  get userId() {
    return this.data.userId;
  }
  get name() {
    return this.data.name;
  }
  get type() {
    return this.data.type;
  }
  get createdAt() {
    return this.data.createdAt;
  }
  get updatedAt() {
    return this.data.updatedAt;
  }
  get description() {
    return this.data.description;
  }
  get exampleUrl() {
    return this.data.exampleUrl;
  }
  get repetitions() {
    return this.#repetitions;
  }
}

export { ExerciseTemplateEntity, ExerciseType };
