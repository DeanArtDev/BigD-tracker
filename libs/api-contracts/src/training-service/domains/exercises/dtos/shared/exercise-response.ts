import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ExerciseWithRepetitionsDto } from './exercise-with-repetitions.dto';
import { ExerciseDto } from './exercise.dto';

class ExerciseRes {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseDto)
  data: ExerciseDto[];
}

class ExerciseResSingle {
  @ValidateNested()
  @Type(() => ExerciseDto)
  data: ExerciseDto;
}

class ExerciseWithRepetitionsRes {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseWithRepetitionsDto)
  data: ExerciseWithRepetitionsDto[];
}

class ExerciseWithRepetitionsResSingle {
  @ValidateNested()
  @Type(() => ExerciseWithRepetitionsDto)
  data: ExerciseWithRepetitionsDto;
}

export {
  ExerciseRes,
  ExerciseResSingle,
  ExerciseWithRepetitionsRes,
  ExerciseWithRepetitionsResSingle,
};
