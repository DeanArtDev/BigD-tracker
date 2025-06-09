import { TrainingType } from '@/tranings/entities/training.entity';
import { Validator } from '@shared/lib/validator';

const validator = new Validator('repetitions');

enum RepetitionFinishType {
  DONE = 'DONE',
  SKIP = 'SKIP',
  TRIED = 'TRIED',
  OVER = 'OVER',
}

interface RepetitionEntityData {
  id: number;
  exerciseId: number;
  trainingId?: number;
  userId?: number;
  targetCount: number;
  targetWeight: string;
  targetBreak: number;
  factWeight?: string;
  factCount?: number;
  factBreak?: number;
  finishType?: RepetitionFinishType;
}

type FinishData = Pick<
  Required<RepetitionEntityData>,
  'factCount' | 'factWeight' | 'factBreak' | 'finishType'
>;

type InitData = Pick<
  RepetitionEntityData,
  'id' | 'exerciseId' | 'userId' | 'targetCount' | 'targetWeight' | 'targetBreak'
>;

class RepetitionEntity {
  #data: RepetitionEntityData;
  targetWeight: string;

  constructor(init: InitData) {
    const { id, userId, targetCount, targetBreak, targetWeight, exerciseId } = init;

    validator.isIdValId(id, 'id');
    validator.isIdValId(exerciseId, 'exerciseId');

    if (userId != null) {
      validator.isIdValId(userId, 'userId');
    }

    validator.isNotIntFloat(targetCount, 'targetCount');
    validator.isIntMax(targetCount, 300, 'targetCount');
    validator.isNotIntFloat(targetBreak, 'targetBreak');
    validator.isIntMax(targetBreak, 900, 'targetBreak');
    validator.isNumericString(targetWeight, 'targetWeight');

    this.targetWeight = targetWeight;
    this.#data = { ...init };
  }

  public finish({ finishType, factWeight, factCount, factBreak }: FinishData) {
    validator.isEnum(finishType, TrainingType, 'finishType');
    validator.isNotIntFloat(factCount, 'factCount');
    validator.isIntMax(factCount, 300, 'factCount');
    validator.isNotIntFloat(factBreak, 'factBreak');
    validator.isIntMax(factBreak, 900, 'factBreak');
    validator.isNumericString(factWeight, 'factWeight');

    this.#data.finishType = finishType;
    this.#data.factWeight = factWeight;
    this.#data.factCount = factCount;
    this.#data.factBreak = factBreak;
  }

  public assign(trainingId: number) {
    if (this.#data.trainingId != null) {
      validator.throwError(
        `Can not reassign repetition {id: ${this.id}} to {trainingId:${trainingId}}`,
        'trainingId',
      );
    }
    this.#data.trainingId = trainingId;
  }

  get id() {
    return this.#data.id;
  }
  get exerciseId() {
    return this.#data.exerciseId;
  }
  get trainingId() {
    return this.#data.trainingId;
  }
  get userId() {
    return this.#data.userId;
  }
  get targetCount() {
    return this.#data.targetCount;
  }
  get factCount() {
    return this.#data.factCount;
  }
  // get targetWeight() {
  //   return this.#data.targetWeight;
  // }
  get factWeight() {
    return this.#data.factWeight;
  }
  get targetBreak() {
    return this.#data.targetBreak;
  }
  get factBreak() {
    return this.#data.factBreak;
  }
  get finishType() {
    return this.#data.finishType;
  }
}

export { RepetitionEntity, RepetitionFinishType };
