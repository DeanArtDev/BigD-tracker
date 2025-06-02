import { Validator } from '@shared/lib/validator';
import { ExerciseType } from './exercise.entity';

const validator = new Validator('exercises-templates');

class ExerciseTemplateEntity {
  constructor(data: ExerciseTemplateEntity) {
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

    this.id = id;
    this.userId = userId;
    this.name = name;
    this.type = type;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.description = description;
    this.exampleUrl = exampleUrl;
  }

  public id: number;
  public userId?: number;
  public name: string;
  public type: ExerciseType;
  public createdAt: string;
  public updatedAt: string;
  public description?: string;
  public exampleUrl?: string;
}

export { ExerciseTemplateEntity };
