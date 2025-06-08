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
  userId?: number;
  targetCount: number;
  factCount?: number;
  targetWeight: number;
  factWeight?: number;
  targetBreak: number;
  factBreak?: number;
  finishType: RepetitionFinishType;
}

class RepetitionEntity {
  constructor(private data: RepetitionEntityData) {
    const {
      id,
      userId,
      targetCount,
      targetBreak,
      targetWeight,
      factBreak,
      factCount,
      factWeight,
      exerciseId,
      finishType,
    } = data;

    validator.isIdValId(id, 'id');
    validator.isIdValId(exerciseId, 'exerciseId');
    validator.isEnum(finishType, TrainingType, 'finishType');

    if (userId != null) {
      validator.isIdValId(userId, 'userId');
    }

    validator.isNotIntFloat(targetCount, 'targetCount');
    validator.isIntMax(targetCount, 300, 'targetCount');
    if (factCount != null) {
      validator.isNotIntFloat(factCount, 'factCount');
      validator.isIntMax(factCount, 300, 'factCount');
    }

    validator.isNotIntFloat(targetBreak, 'targetBreak');
    validator.isIntMax(targetBreak, 900, 'targetBreak');
    if (factBreak != null) {
      validator.isNotIntFloat(factBreak, 'factBreak');
      validator.isIntMax(factBreak, 900, 'factBreak');
    }

    validator.isIntMax(targetWeight, 999.99, 'targetWeight');
    if (factWeight != null) {
      validator.isIntMax(factWeight, 999.99, 'factWeight');
    }
  }

  get id() {
    return this.data.id;
  }
  get exerciseId() {
    return this.data.exerciseId;
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

export { RepetitionEntity, RepetitionFinishType };
