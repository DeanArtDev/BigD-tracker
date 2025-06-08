import { Validator } from '@shared/lib/validator';

enum TrainingType {
  LIGHT = 'LIGHT',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  MIXED = 'MIXED',
}

const validator = new Validator('trainings');

interface TrainingEntityData {
  id: number;
  name: string;
  type: TrainingType;
  userId: number;
  startDate: string;
  postTrainingDuration?: number;
  wormUpDuration?: number;
  createdAt: string;
  updatedAt: string;
  endDate?: string;
  description?: string;
  inProgress: boolean;
}

class TrainingEntity {
  constructor(private readonly data: TrainingEntityData) {
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
      inProgress,
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

    if (inProgress && endDate != null) {
      validator.throwError('Training cannot be in progress if has the end date', 'inProgress');
    }

    validator.isIdValId(id, 'id');
    validator.isIdValId(userId, 'userId');
    validator.isNotStringEmpty(name, 'name');
    validator.isEnum(type, TrainingType, 'type');
    validator.isDateISO(createdAt, 'createdAt');
    validator.isDateISO(updatedAt, 'updatedAt');
  }

  updateWormUpDuration(value: number | undefined) {
    if (this.endDate != null) {
      validator.throwError(
        'Cannot update wormUpDuration after training has ended',
        'wormUpDuration',
      );
    }

    this.data.wormUpDuration = value;
    return this;
  }

  updatePostTrainingDuration(value: number | undefined) {
    if (this.endDate != null) {
      validator.throwError(
        'Cannot update postTrainingDuration after training has ended',
        'postTrainingDuration',
      );
    }

    this.data.postTrainingDuration = value;
    return this;
  }

  updateInProgress(value: boolean) {
    if (this.endDate != null && value) {
      validator.throwError('Cannot start training if it has already ended', 'inProgress');
    }

    if (this.endDate == null && !value) {
      validator.throwError(
        `Cannot set inProgress: ${value} if it has not had end time yet`,
        'inProgress',
      );
    }

    this.data.inProgress = value;
    return this;
  }

  get id() {
    return this.data.id;
  }
  get name() {
    return this.data.name;
  }
  get type() {
    return this.data.type;
  }
  get userId() {
    return this.data.userId;
  }
  get startDate() {
    return this.data.startDate;
  }
  get postTrainingDuration() {
    return this.data.postTrainingDuration;
  }
  get wormUpDuration() {
    return this.data.wormUpDuration;
  }
  get createdAt() {
    return this.data.createdAt;
  }
  get updatedAt() {
    return this.data.updatedAt;
  }
  get endDate() {
    return this.data.endDate;
  }
  get description() {
    return this.data.description;
  }

  get inProgress() {
    return this.data.inProgress;
  }

  get isCompleted() {
    return !this.data.inProgress && this.data.endDate != null;
  }
}

export { TrainingEntity, TrainingType };
