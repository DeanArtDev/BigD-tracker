import { RepetitionDto } from '@modules/repetitions';
import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ExerciseDto } from './exercise.dto';

class ExerciseWithRepetitionsDto extends ExerciseDto {
  @Expose()
  @Type(() => RepetitionDto)
  @ValidateNested({ each: true })
  repetitions: RepetitionDto[];
}

export { ExerciseWithRepetitionsDto };
