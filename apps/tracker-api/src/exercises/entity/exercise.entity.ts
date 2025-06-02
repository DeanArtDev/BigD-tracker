import { Validator } from '@shared/lib/validator';

const validator = new Validator('exercises');

enum ExerciseType {
  'WORM-UP' = 'WORM-UP',
  'POST-TRAINING' = 'POST-TRAINING',
  'AEROBIC' = 'AEROBIC',
  'ANAEROBIC' = 'ANAEROBIC',
}

class ExerciseEntity {
  constructor(data: ExerciseEntity) {
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

    this.id = id;
    this.userId = userId;
    this.trainingId = trainingId;
    this.name = name;
    this.type = type;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.description = description;
    this.exampleUrl = exampleUrl;
  }

  public id: number;
  public userId: number;
  public trainingId: number;
  public name: string;
  public type: ExerciseType;
  public createdAt: string;
  public updatedAt: string;
  public description?: string;
  public exampleUrl?: string;
}

export { ExerciseEntity, ExerciseType };
