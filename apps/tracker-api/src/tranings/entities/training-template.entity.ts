import { Validator } from '@shared/lib/validator';
import { TrainingType } from './training.entity';

const validator = new Validator('trainings_templates');

interface TrainingTemplateEntityData {
  readonly id: number;
  readonly name: string;
  readonly type: TrainingType;
  readonly userId?: number;
  readonly postTrainingDuration?: number;
  readonly wormUpDuration?: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly description?: string;
}

class TrainingTemplateEntity {
  constructor(data: TrainingTemplateEntityData) {
    const {
      id,
      name,
      type,
      userId,
      createdAt,
      updatedAt,
      wormUpDuration,
      postTrainingDuration,
      description,
    } = data;

    if (description != null) {
      validator.isNotStringEmpty(description, 'description');
    }

    if (postTrainingDuration != null) {
      const mins = 1000 * 60 * 3;
      validator.isNotIntFloat(postTrainingDuration, 'postTrainingDuration');
      validator.isIntGt(postTrainingDuration, mins, 'postTrainingDuration');
    }

    if (wormUpDuration != null) {
      const mins = 1000 * 60 * 3;
      validator.isNotIntFloat(wormUpDuration, 'wormUpDuration');
      validator.isIntGt(wormUpDuration, mins, 'wormUpDuration');
    }
    if (userId != null) {
      validator.isIdValId(userId, 'userId');
    }

    validator.isIdValId(id, 'id');
    validator.isNotStringEmpty(name, 'name');
    validator.isEnum(type, TrainingType, 'type');
    validator.isDateISO(createdAt, 'createdAt');
    validator.isDateISO(updatedAt, 'updatedAt');

    Object.assign(this, {
      id,
      name,
      type,
      userId,
      createdAt,
      updatedAt,
      wormUpDuration,
      postTrainingDuration,
      description,
    });
  }

  public readonly id: number;
  public readonly name: string;
  public readonly type: TrainingType;
  public readonly userId?: number;
  public readonly postTrainingDuration?: number;
  public readonly wormUpDuration?: number;
  public readonly createdAt: string;
  public readonly updatedAt: string;
  public readonly description?: string;
}

export { TrainingTemplateEntity };
