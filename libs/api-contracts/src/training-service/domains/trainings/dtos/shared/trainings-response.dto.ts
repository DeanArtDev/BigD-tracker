import { TrainingWithExercisesDto } from './training-with-exercises.dto';
import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

class TrainingWithExercisesRes {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrainingWithExercisesDto)
  data: TrainingWithExercisesDto[];
}

class TrainingWithExercisesResSingle {
  @Expose()
  @ValidateNested()
  @Type(() => TrainingWithExercisesDto)
  data: TrainingWithExercisesDto;
}

export { TrainingWithExercisesRes, TrainingWithExercisesResSingle };
