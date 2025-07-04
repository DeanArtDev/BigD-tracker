import { Expose, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { ExerciseWithRepetitionsRes } from './shared/exercise-response';

class ReqData {
  @IsInt()
  @Expose()
  userId: number;

  @IsOptional()
  @Expose()
  @IsBoolean()
  my?: boolean;
}

class GetExerciseTemplatesReq {
  @Expose()
  @Type(() => ReqData)
  @ValidateNested()
  data: ReqData;
}

class GetExerciseTemplatesRes extends ExerciseWithRepetitionsRes {}

export { GetExerciseTemplatesReq, GetExerciseTemplatesRes };
