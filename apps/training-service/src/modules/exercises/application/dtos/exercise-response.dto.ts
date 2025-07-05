import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ExerciseDto } from './exercise.dto';

class ExerciseResponse {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseDto)
  data: ExerciseDto[];
}

class ExerciseResponseSingle {
  @ValidateNested()
  @Type(() => ExerciseDto)
  data: ExerciseDto;
}

export { ExerciseResponseSingle, ExerciseResponse };
