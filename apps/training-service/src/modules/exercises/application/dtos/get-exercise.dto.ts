import { Expose } from 'class-transformer';
import { IsBooleanString, IsOptional } from 'class-validator';

class GetExerciseQuery {
  @IsOptional()
  @Expose()
  @IsBooleanString()
  my?: boolean;
}

export { GetExerciseQuery };
