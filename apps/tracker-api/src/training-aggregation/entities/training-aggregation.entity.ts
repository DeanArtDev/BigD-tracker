import { ExerciseEntity } from '@/exercises/entity/exercise.entity';
import { TrainingEntity } from '@/tranings/entities/training.entity';
import { DomainValidationError } from '@shared/lib/domain-validation.error';
import { Validator } from '@shared/lib/validator';

const validator = new Validator('trainings-aggregation');

class TrainingAggregationEntity extends TrainingEntity {
  constructor(data: ConstructorParameters<typeof TrainingEntity>[0]) {
    super(data);
  }

  public exercises: ExerciseEntity[] = [];

  public addExercises(exercises: ExerciseEntity[]) {
    const wrongIds = exercises.filter((x) => x.trainingId !== this.id).map((x) => x.id);
    if (wrongIds.length > 0) {
      throw new DomainValidationError({
        field: 'exercise.trainingId',
        domain: 'trainings-aggregation',
        message: `exercises {${wrongIds.join(', ')}} must belong to training with id: ${this.id}`,
      });
    }

    validator.isIntLt(exercises.length, 10, 'exercise.length');
    this.exercises = exercises;
    return this;
  }
}

export { TrainingAggregationEntity };
