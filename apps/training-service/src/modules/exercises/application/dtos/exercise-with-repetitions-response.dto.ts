import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ExerciseWithRepetitionsDto } from './exercise-with-repetitions.dto';

class ExerciseWithRepetitionsResponse {
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => ExerciseWithRepetitionsDto)
  data: ExerciseWithRepetitionsDto[];
}

class ExerciseWithRepetitionsResponseSingle {
  @ValidateNested()
  @Type(() => ExerciseWithRepetitionsDto)
  data: ExerciseWithRepetitionsDto;
}

export { ExerciseWithRepetitionsResponseSingle, ExerciseWithRepetitionsResponse };
