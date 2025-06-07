import { ExerciseTemplateEntity } from '@/exercises-templates/entity/exercise-template.entity';
import { TrainingEntity } from '@/tranings/entities/training.entity';
import { Validator } from '@shared/lib/validator';

const validator = new Validator('trainings-aggregation');

class TrainingAggregationEntity extends TrainingEntity {
  constructor(data: ConstructorParameters<typeof TrainingEntity>[0]) {
    super(data);
  }

  public exercises: ExerciseTemplateEntity[] = [];

  public addExercises(exercises: ExerciseTemplateEntity[]) {
    validator.isIntMax(exercises.length, 10, 'exercise.length');
    this.exercises = exercises;
    return this;
  }
}

export { TrainingAggregationEntity };
