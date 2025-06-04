import { Validator } from '@shared/lib/validator';
import { ExerciseType } from './exercise.entity';

const validator = new Validator('exercises-templates');

interface ExerciseTemplateData {
  readonly id: number;
  readonly userId?: number;
  readonly name: string;
  readonly type: ExerciseType;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly description?: string;
  readonly exampleUrl?: string;
}

class ExerciseTemplateEntity {
  constructor(data: ExerciseTemplateData) {
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

    Object.assign(this, {
      id,
      userId,
      description,
      name,
      type,
      exampleUrl,
      createdAt,
      updatedAt,
    });
  }

  public readonly id: number;
  public readonly userId?: number;
  public readonly name: string;
  public readonly type: ExerciseType;
  public readonly createdAt: string;
  public readonly updatedAt: string;
  public readonly description?: string;
  public readonly exampleUrl?: string;
}

export { ExerciseTemplateEntity };
