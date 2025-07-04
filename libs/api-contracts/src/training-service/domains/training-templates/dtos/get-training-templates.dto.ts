import { Expose, Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';
import { TrainingTemplateWithExercisesResSingle } from './shared/training-templates-response.dto';

class ReqData {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsInt()
  userId: number;
}

class GetOneTemplatesReq {
  @Expose()
  @Type(() => ReqData)
  @ValidateNested()
  data: ReqData;
}

class GetOneTemplatesRes extends TrainingTemplateWithExercisesResSingle {}

export { GetOneTemplatesReq, GetOneTemplatesRes };
