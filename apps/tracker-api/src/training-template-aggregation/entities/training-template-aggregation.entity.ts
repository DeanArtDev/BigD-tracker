import { ExerciseTemplateEntity } from '@/exercises-templates/entity/exercise-template.entity';
import { TrainingTemplateEntity } from '@/tranings/entities/training-template.entity';
import { Validator } from '@shared/lib/validator';

const validator = new Validator('trainings-aggregation');

class TrainingTemplateAggregationEntity extends TrainingTemplateEntity {
  constructor(data: ConstructorParameters<typeof TrainingTemplateEntity>[0]) {
    super(data);
  }

  public exercises: ExerciseTemplateEntity[] = [];

  public addExercises(exercises: ExerciseTemplateEntity[]) {
    validator.isIntMax(exercises.length, 10, 'exercise.length');
    this.exercises = exercises;
    return this;
  }
}

export { TrainingTemplateAggregationEntity };
