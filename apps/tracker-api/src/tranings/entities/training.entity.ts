import { Validator } from '@shared/lib/validator';

enum TrainingType {
  LIGHT = 'LIGHT',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  MIXED = 'MIXED',
}

const validator = new Validator('trainings');

interface TrainingEntityData {
  readonly id: number;
  readonly name: string;
  readonly type: TrainingType;
  readonly userId: number;
  readonly startDate: string;
  readonly postTrainingDuration?: number;
  readonly wormUpDuration?: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly endDate?: string;
  readonly description?: string;
}

class TrainingEntity {
  constructor(data: TrainingEntityData) {
    const {
      id,
      name,
      type,
      userId,
      createdAt,
      updatedAt,
      endDate,
      wormUpDuration,
      postTrainingDuration,
      startDate,
      description,
    } = data;

    if (description != null) {
      validator.isNotStringEmpty(description, 'description');
    }

    validator.isDateISO(startDate, 'startDate');
    if (endDate != null) {
      validator.isDateISO(endDate, 'endDate');
      validator.isDateAfter(endDate, startDate, 'startDate');
    }

    if (postTrainingDuration != null) {
      validator.isNotIntFloat(postTrainingDuration, 'postTrainingDuration');
      validator.isIntMax(postTrainingDuration, 60, 'postTrainingDuration');
      validator.isIntGt(postTrainingDuration, 3, 'postTrainingDuration');
    }

    if (wormUpDuration != null) {
      validator.isNotIntFloat(wormUpDuration, 'wormUpDuration');
      validator.isIntMax(wormUpDuration, 60, 'wormUpDuration');
      validator.isIntGt(wormUpDuration, 3, 'wormUpDuration');
    }

    validator.isIdValId(id, 'id');
    validator.isIdValId(userId, 'userId');
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
      endDate,
      startDate,
      description,
    });
    this.#wormUpDuration = wormUpDuration;
    this.#postTrainingDuration = postTrainingDuration;
  }

  updateWormUpDuration(value: number | undefined) {
    if (this.endDate != null) {
      validator.throwError(
        'Cannot update wormUpDuration after training has ended',
        'wormUpDuration',
      );
    }

    this.#wormUpDuration = value;
    return this;
  }
  get wormUpDuration() {
    return this.#wormUpDuration;
  }

  updatePostTrainingDuration(value: number | undefined) {
    if (this.endDate != null) {
      validator.throwError(
        'Cannot update postTrainingDuration after training has ended',
        'postTrainingDuration',
      );
    }

    this.#postTrainingDuration = value;
    return this;
  }
  get postTrainingDuration() {
    return this.#postTrainingDuration;
  }

  public readonly id: number;
  public readonly name: string;
  public readonly type: TrainingType;
  public readonly userId: number;
  public readonly startDate: string;
  public readonly createdAt: string;
  public readonly updatedAt: string;
  public readonly endDate?: string;
  public readonly description?: string;

  #postTrainingDuration?: number;
  #wormUpDuration?: number;
}

export { TrainingEntity, TrainingType };
