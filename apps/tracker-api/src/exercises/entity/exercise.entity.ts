import { Validator } from '@shared/lib/validator';

const validator = new Validator('exercises');

enum ExerciseType {
  'WORM-UP' = 'WORM-UP',
  'POST-TRAINING' = 'POST-TRAINING',
  'AEROBIC' = 'AEROBIC',
  'ANAEROBIC' = 'ANAEROBIC',
}

interface ExerciseEntityData {
  readonly id: number;
  readonly userId: number;
  readonly trainingId: number;
  readonly name: string;
  readonly type: ExerciseType;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly description?: string;
  readonly exampleUrl?: string;
}

class ExerciseEntity {
  constructor(private readonly data: ExerciseEntityData) {
    const { id, trainingId, userId, description, name, type, exampleUrl, createdAt, updatedAt } =
      data;

    if (exampleUrl != null) {
      validator.isUrl(exampleUrl, 'exampleUrl');
    }

    if (description != null) {
      validator.isNotStringEmpty(description, 'description');
    }

    validator.isIdValId(id, 'id');
    validator.isIdValId(trainingId, 'trainingId');
    validator.isIdValId(userId, 'userId');
    validator.isNotStringEmpty(name, 'name');
    validator.isEnum(type, ExerciseType, 'type');
    validator.isDateISO(createdAt, 'createdAt');
    validator.isDateISO(updatedAt, 'updatedAt');
  }

  get id() {
    return this.data.id;
  }
  get userId() {
    return this.data.userId;
  }
  get trainingId() {
    return this.data.trainingId;
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
}

export { ExerciseEntity, ExerciseType };
