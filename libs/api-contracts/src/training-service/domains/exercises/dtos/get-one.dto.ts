import { Expose, Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';
import { ExerciseWithRepetitionsResSingle } from './shared/exercise-response';

class ReqData {
  @IsInt()
  @Expose()
  id: number;

  @IsInt()
  @Expose()
  userId: number;
}

class GetOneExerciseReq {
  @Expose()
  @Type(() => ReqData)
  @ValidateNested()
  data: ReqData;
}

class GetOneExerciseRes extends ExerciseWithRepetitionsResSingle {}

export { GetOneExerciseReq, GetOneExerciseRes };
