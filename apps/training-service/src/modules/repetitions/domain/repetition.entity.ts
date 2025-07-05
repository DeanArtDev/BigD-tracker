import { DomainValidator } from '@big-d/api-utils';
import { RepetitionFinishType } from '../application/repetitions.repository';
import { randomInt } from 'crypto';

const validator = new DomainValidator('repetitions');

interface CreateData {
  readonly exerciseId: number;
  readonly userId?: number;
  readonly position: number;
  readonly targetCount: number;
  readonly targetWeight: string;
  readonly description?: string;
  readonly targetBreak: number;
}

interface RepetitionEntityData {
  readonly id: number;
  readonly exerciseId: number;
  readonly userId?: number;
  position: number;
  description?: string;
  targetCount: number;
  targetWeight: string;
  targetBreak: number;
  factWeight?: string;
  factCount?: number;
  factBreak?: number;
  finishType?: RepetitionFinishType;
}

class RepetitionEntity {
  private constructor(private data: RepetitionEntityData) {
    this.validate();
  }

  static restore = (data: RepetitionEntityData): RepetitionEntity => {
    return new RepetitionEntity(data);
  };

  static create = (data: CreateData): RepetitionEntity => {
    return new RepetitionEntity({
      id: randomInt(0, Date.now()),
      ...data,
    }).validate();
  };

  public updatePosition(position: number): this {
    this.data.position = position;
    this.validate();
    return this;
  }

  public setFact(data: {
    description?: string;
    factWeight: string;
    factCount: number;
    finishType: RepetitionFinishType;
  }): this {
    if (this.status !== 'inactive') {
      validator.throwError(
        `Repetition: ${this.data.id} with status ${this.status} can not get facts`,
        'setFact',
      );
    }

    if (data.description != null) {
      validator.isNotStringEmpty(data.description, 'setFact');
    }

    this.data.finishType = data.finishType;
    this.data.factWeight = data.factWeight;
    this.data.factCount = data.factCount;

    this.validate();
    return this;
  }

  public setDuration(data: { factBreak: number }): this {
    if (this.status !== 'break') {
      validator.throwError('Setting factBreak only on break status', 'status');
    }

    this.data.factBreak = data.factBreak;

    this.validate();
    return this;
  }

  public updateTargets(data: {
    targetCount: number;
    targetWeight: string;
    targetBreak: number;
  }): this {
    if (this.data.finishType != null) {
      validator.throwError('Can not update target after repetition finishing', 'updateTargets');
    }
    this.data.targetCount = data.targetCount;
    this.data.targetWeight = data.targetWeight;
    this.data.targetBreak = data.targetBreak;
    this.validate();
    return this;
  }

  public updateDescription(data?: string): this {
    this.data.description = data;
    this.validate();
    return this;
  }

  public canSetBreak(): boolean {
    if (this.status !== 'break') {
      validator.throwError('Setting factBreak only on break status', 'status');
    }
    return true;
  }

  public canStart(exerciseId: number) {
    if (this.data.exerciseId !== exerciseId) {
      validator.throwError(
        `Repetition ${this.data.id} can't be started without a relation to a exercise ${exerciseId}`,
        'canStart',
      );
    }

    if (['break', 'done'].includes(this.status)) {
      validator.throwError(
        `Repetition ${this.data.id} has an inappropriate status: ${this.status} to be finished`,
        'canStart',
      );
    }

    return true;
  }

  public canFinish(exerciseId: number) {
    if (this.data.exerciseId !== exerciseId) {
      validator.throwError(
        `Repetition ${this.data.id} can't be finished without a relation to a exercise ${exerciseId}`,
        'canFinish',
      );
    }

    if (this.status !== 'done') {
      validator.throwError(
        `Repetition ${this.data.id} has an inappropriate status: ${this.status} to be finished`,
        'canFinish',
      );
    }

    return true;
  }

  public validate(): this {
    const data = this.data;

    if (data.userId != null) {
      validator.isIdValId(data.userId, 'userId');
    }
    if (data.id != null) validator.isIdValId(data.id, 'id');
    if (data.exerciseId != null) validator.isIdValId(data.exerciseId, 'exerciseId');
    if (data.description != null) {
      validator.isNotStringEmpty(data.description, 'description');
    }

    if (data.targetCount != null) validator.isNotIntFloat(data.targetCount, 'targetCount');
    if (data.targetCount != null) validator.isIntMax(data.targetCount, 300, 'targetCount');
    if (data.targetBreak != null) validator.isNotIntFloat(data.targetBreak, 'targetBreak');
    if (data.targetBreak != null) validator.isIntMax(data.targetBreak, 900, 'targetBreak');
    if (data.targetWeight != null) validator.isNumericString(data.targetWeight, 'targetWeight');
    if (data.targetWeight != null) validator.isFloatMax(data.targetWeight, 999.99, 'targetWeight');

    if (data.finishType != null) {
      validator.isEnum(data.finishType, RepetitionFinishType, 'finishType');
    }
    if (data.factCount != null) validator.isNotIntFloat(data.factCount, 'factCount');
    if (data.factCount != null) validator.isIntMax(data.factCount, 300, 'factCount');
    if (data.factBreak != null) validator.isNotIntFloat(data.factBreak, 'factBreak');
    if (data.factBreak != null) validator.isIntMax(data.factBreak, 900, 'factBreak');
    if (data.factWeight != null) validator.isNumericString(data.factWeight, 'factWeight');
    return this;
  }

  get status(): 'inactive' | 'done' | 'break' {
    if (
      [this.finishType, this.factWeight, this.factBreak, this.factCount].every((i) => i != null)
    ) {
      return 'done';
    }

    if ([this.finishType, this.factWeight, this.factCount].every((i) => i != null)) {
      return 'break';
    }

    return 'inactive';
  }

  get id() {
    return this.data.id;
  }
  get exerciseId() {
    return this.data.exerciseId;
  }
  get description() {
    return this.data.description;
  }
  get userId() {
    return this.data.userId;
  }
  get targetCount() {
    return this.data.targetCount;
  }
  get targetWeight() {
    return this.data.targetWeight;
  }
  get targetBreak() {
    return this.data.targetBreak;
  }

  get factCount() {
    return this.data.factCount;
  }
  get factWeight() {
    return this.data.factWeight;
  }
  get factBreak() {
    return this.data.factBreak;
  }
  get finishType() {
    return this.data.finishType;
  }
  get position() {
    return this.data.position;
  }
}

export { RepetitionEntity, RepetitionEntityData };
