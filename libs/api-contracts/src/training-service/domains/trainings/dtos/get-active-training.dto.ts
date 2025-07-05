import { Expose, Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';
import { TrainingWithExercisesResSingle } from './shared/trainings-response.dto';

class ReqData {
  @Expose()
  @IsInt()
  userId: number;
}

class GetActiveTrainingReq {
  @Expose()
  @Type(() => ReqData)
  @ValidateNested()
  data: ReqData;
}

class GetActiveTrainingRes extends TrainingWithExercisesResSingle {}

export { GetActiveTrainingReq, GetActiveTrainingRes };
