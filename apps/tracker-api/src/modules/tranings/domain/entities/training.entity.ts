import { Validator } from '@shared/lib/validator';
import { TrainingType } from '../../application/trainings.repository';

const validator = new Validator('trainings');

interface TrainingEntityData {
  readonly id: number;
  readonly userId: number;
  name: string;
  type: TrainingType;
  startDate: string;
  postTrainingDuration?: number;
  wormUpDuration?: number;
  endDate?: string;
  description?: string;
  inProgress: boolean;
}

interface CreateData {
  readonly id?: number;
  readonly userId: number;
  readonly name: string;
  readonly type: TrainingType;
  readonly startDate: string;
  readonly postTrainingDuration?: number;
  readonly wormUpDuration?: number;
  readonly description?: string;
}

interface TrainingEntityUpdateInput {
  readonly name: string;
  readonly type: TrainingType;
  readonly description?: string;
}

class TrainingEntity {
  static create(data: CreateData): TrainingEntity {
    return new TrainingEntity({
      ...data,
      id: data.id ?? Infinity,
      inProgress: false,
    }).validate();
  }

  static restore(data: TrainingEntityData) {
    return new TrainingEntity(data);
  }

  protected constructor(protected readonly data: TrainingEntityData) {
    this.validate();
  }

  update(input: TrainingEntityUpdateInput): this {
    this.data.name = input.name;
    this.data.type = input.type;
    this.data.description = input.description;

    this.validate();
    return this;
  }

  updateWormUpDuration(value: number | undefined): this {
    if (this.endDate != null) {
      validator.throwError(
        'Cannot update wormUpDuration after training has ended',
        'wormUpDuration',
      );
    }

    this.data.wormUpDuration = value;

    this.validate();
    return this;
  }

  updatePostTrainingDuration(value: number | undefined): this {
    if (this.endDate != null) {
      validator.throwError(
        'Cannot update postTrainingDuration after training has ended',
        'postTrainingDuration',
      );
    }

    this.data.postTrainingDuration = value;
    this.validate();
    return this;
  }

  start(): this {
    if (this.endDate != null) {
      validator.throwError('Cannot start training if it has already ended', 'start');
    }

    this.data.inProgress = true;
    this.validate();
    return this;
  }

  finish(): this {
    if (this.endDate != null) {
      validator.throwError(`Cannot finish training if it has already ended`, 'finish');
    }
    this.data.inProgress = false;
    this.data.endDate = new Date().toISOString();
    this.validate();
    return this;
  }

  public validate(): this {
    const {
      id = Infinity,
      name,
      type,
      userId,
      wormUpDuration,
      postTrainingDuration,
      startDate,
      description,
      endDate,
    } = this.data;

    if (description != null) {
      validator.isNotStringEmpty(description, 'description');
    }

    validator.isDateISO(startDate, 'startDate');

    if (endDate != null) {
      validator.isDateISO(endDate, 'endDate');
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

    if (id != null) validator.isIdValId(id, 'id');

    validator.isIdValId(userId, 'userId');
    validator.isNotStringEmpty(name, 'name');
    validator.isEnum(type, TrainingType, 'type');

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

export { TrainingEntity, TrainingEntityData, TrainingEntityUpdateInput };
