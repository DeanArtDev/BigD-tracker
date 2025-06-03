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
  constructor(data: ExerciseEntityData) {
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

    Object.assign(this, {
      id,
      name,
      type,
      userId,
      createdAt,
      updatedAt,
      trainingId,
      exampleUrl,
      description,
    });
  }

  public readonly id: number;
  public readonly userId: number;
  public readonly trainingId: number;
  public readonly name: string;
  public readonly type: ExerciseType;
  public readonly createdAt: string;
  public readonly updatedAt: string;
  public readonly description?: string;
  public readonly exampleUrl?: string;
}

export { ExerciseEntity, ExerciseType };
