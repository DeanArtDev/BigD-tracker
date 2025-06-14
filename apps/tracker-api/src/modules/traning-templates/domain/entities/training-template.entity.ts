import { TrainingType } from '@/modules/tranings';
import { Validator } from '@shared/lib/validator';

const validator = new Validator('training-templates');

interface TrainingTemplateEntityData {
  readonly id: number;
  readonly userId?: number;
  name: string;
  type: TrainingType;
  postTrainingDuration?: number;
  wormUpDuration?: number;
  description?: string;
}

interface CreateData {
  readonly id?: number;
  readonly userId?: number;
  readonly name: string;
  readonly type: TrainingType;
  readonly postTrainingDuration?: number;
  readonly wormUpDuration?: number;
  readonly description?: string;
}

interface TrainingTemplateEntityUpdateInput {
  readonly name: string;
  readonly type: TrainingType;
  readonly description?: string;
  readonly postTrainingDuration?: number;
  readonly wormUpDuration?: number;
}

class TrainingTemplateEntity {
  static create(data: CreateData): TrainingTemplateEntity {
    return new TrainingTemplateEntity({
      ...data,
      id: data.id ?? Infinity,
    }).validate();
  }

  static restore(data: TrainingTemplateEntityData) {
    return new TrainingTemplateEntity(data);
  }

  protected constructor(protected readonly data: TrainingTemplateEntityData) {
    this.validate();
  }

  update(input: TrainingTemplateEntityUpdateInput): this {
    this.data.name = input.name;
    this.data.type = input.type;
    this.data.description = input.description;
    this.data.postTrainingDuration = input.postTrainingDuration;
    this.data.wormUpDuration = input.wormUpDuration;

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
      description,
    } = this.data;

    if (description != null) {
      validator.isNotStringEmpty(description, 'description');
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
    if (userId != null) validator.isIdValId(userId, 'userId');

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
  get postTrainingDuration() {
    return this.data.postTrainingDuration;
  }
  get wormUpDuration() {
    return this.data.wormUpDuration;
  }
  get description() {
    return this.data.description;
  }
}

export { TrainingTemplateEntity, TrainingTemplateEntityData, TrainingTemplateEntityUpdateInput };
