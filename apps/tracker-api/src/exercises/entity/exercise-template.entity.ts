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
}

export { ExerciseTemplateEntity };
