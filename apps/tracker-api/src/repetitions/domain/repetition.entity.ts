import { Validator } from '@shared/lib/validator';
import { RepetitionFinishType } from '../application/repetitions.repository';

const validator = new Validator('repetitions');

interface CreateData {
  exerciseId: number;
  userId?: number;
  targetCount: number;
  targetWeight: string;
  description?: string;
  targetBreak: number;
}

interface RepetitionEntityData {
  readonly id: number;
  readonly exerciseId: number;
  readonly userId?: number;
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
  private constructor(private data: RepetitionEntityData) {}

  static restore = (data: RepetitionEntityData): RepetitionEntity => {
    return new RepetitionEntity(data);
  };

  static create = (data: CreateData): RepetitionEntity => {
    const { userId, targetCount, targetBreak, targetWeight, exerciseId, description } = data;

    RepetitionEntity.#validateTargets({ targetCount, targetBreak, targetWeight });

    if (userId != null) {
      validator.isIdValId(userId, 'userId');
    }
    if (exerciseId != null) validator.isIdValId(exerciseId, 'exerciseId');
    if (description != null) {
      validator.isNotStringEmpty(description, 'description');
    }

    return new RepetitionEntity({
      ...data,
      id: Infinity,
      exerciseId: exerciseId ?? Infinity,
    });
  };

  public finish(data: {
    description?: string;
    factWeight: string;
    factCount: number;
    factBreak: number;
    finishType: RepetitionFinishType;
  }): RepetitionEntity {
    if (this.data.finishType != null) {
      validator.throwError('It has already finished', 'finish');
    }

    if (data.description != null) {
      validator.isNotStringEmpty(data.description, 'description');
    }

    this.#validateFinishData(data);
    this.data.finishType = data.finishType;
    this.data.factWeight = data.factWeight;
    this.data.factCount = data.factCount;
    this.data.factBreak = data.factBreak;

    return this;
  }

  public updateFacts(data: {
    factCount: number;
    factWeight: string;
    factBreak: number;
  }): RepetitionEntity {
    if (this.data.finishType != null) {
      validator.throwError('Can not update facts after repetition finishing', 'updateTargets');
    }
    this.#validateFinishData(data);
    return this;
  }

  static #validateTargets(data: {
    targetCount: number;
    targetWeight: string;
    targetBreak: number;
  }) {
    validator.isNotIntFloat(data.targetCount, 'targetCount');
    validator.isIntMax(data.targetCount, 300, 'targetCount');
    validator.isNotIntFloat(data.targetBreak, 'targetBreak');
    validator.isIntMax(data.targetBreak, 900, 'targetBreak');
    validator.isNumericString(data.targetWeight, 'targetWeight');
    validator.isFloatMax(data.targetWeight, 999.99, 'targetWeight');
  }

  #validateFinishData(data: {
    factWeight?: string;
    factCount?: number;
    factBreak?: number;
    finishType?: RepetitionFinishType;
  }) {
    if (data.finishType != null) {
      validator.isEnum(data.finishType, RepetitionFinishType, 'finishType');
    }
    if (data.factCount != null) validator.isNotIntFloat(data.factCount, 'factCount');
    if (data.factCount != null) validator.isIntMax(data.factCount, 300, 'factCount');
    if (data.factBreak != null) validator.isNotIntFloat(data.factBreak, 'factBreak');
    if (data.factBreak != null) validator.isIntMax(data.factBreak, 900, 'factBreak');
    if (data.factWeight != null) validator.isNumericString(data.factWeight, 'factWeight');
  }

  get isDraft() {
    return this.data.id === Infinity || this.data.exerciseId === Infinity;
  }

  get isCompleted() {
    return this.data.finishType != null;
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
  get factCount() {
    return this.data.factCount;
  }
  get targetWeight() {
    return this.data.targetWeight;
  }
  get factWeight() {
    return this.data.factWeight;
  }
  get targetBreak() {
    return this.data.targetBreak;
  }
  get factBreak() {
    return this.data.factBreak;
  }
  get finishType() {
    return this.data.finishType;
  }
}

export { RepetitionEntity, RepetitionEntityData };
