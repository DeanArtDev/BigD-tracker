import { Expose, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { TrainingTemplateRes } from './shared/training-templates-response.dto';

class ReqData {
  @Expose()
  @IsInt()
  userId: number;

  @Expose()
  @IsOptional()
  @IsBoolean()
  my?: boolean;
}

class GetTrainingTemplatesReq {
  @Expose()
  @Type(() => ReqData)
  @ValidateNested()
  data: ReqData;
}

class GetTrainingTemplatesRes extends TrainingTemplateRes {}

export { GetTrainingTemplatesReq, GetTrainingTemplatesRes };
