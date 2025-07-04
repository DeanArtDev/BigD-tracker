import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { TrainingTemplateWithExercisesDto } from './training-template-with-exercises.dto';
import { TrainingTemplateDto } from './training-template.dto';

class TrainingTemplateRes {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrainingTemplateDto)
  data: TrainingTemplateDto[];
}

class TrainingTemplateResSingle {
  @Expose()
  @ValidateNested()
  @Type(() => TrainingTemplateDto)
  data: TrainingTemplateDto;
}

class TrainingTemplateWithExercisesRes {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrainingTemplateWithExercisesDto)
  data: TrainingTemplateWithExercisesDto[];
}

class TrainingTemplateWithExercisesResSingle {
  @Expose()
  @ValidateNested()
  @Type(() => TrainingTemplateDto)
  data: TrainingTemplateWithExercisesDto;
}

export {
  TrainingTemplateRes,
  TrainingTemplateResSingle,
  TrainingTemplateWithExercisesRes,
  TrainingTemplateWithExercisesResSingle,
};
