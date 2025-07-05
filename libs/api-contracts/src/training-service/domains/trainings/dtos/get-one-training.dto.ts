import { Expose, Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';
import { TrainingWithExercisesResSingle } from './shared/trainings-response.dto';

class ReqData {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsInt()
  userId: number;
}

class GetOneTrainingReq {
  @Expose()
  @Type(() => ReqData)
  @ValidateNested()
  data: ReqData;
}

class GetOneTrainingRes extends TrainingWithExercisesResSingle {}

export { GetOneTrainingReq, GetOneTrainingRes };
