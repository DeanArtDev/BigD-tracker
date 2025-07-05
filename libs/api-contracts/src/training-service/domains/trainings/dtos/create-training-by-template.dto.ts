import { Expose, Type } from 'class-transformer';
import { IsArray, IsInt, IsISO8601, IsString, ValidateNested } from 'class-validator';
import { TrainingWithExercisesRes } from './shared/trainings-response.dto';

class Item {
  @Expose()
  @IsInt()
  templateId: number;

  @Expose()
  @IsISO8601()
  @IsString()
  startDate: string;
}

class ReqData {
  @Expose()
  @IsInt()
  userId: number;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => Item)
  @IsArray()
  items: Item[];
}

class CreateTrainingByTemplateReq {
  @Expose()
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class CreateTrainingByTemplateRes extends TrainingWithExercisesRes {}

export { CreateTrainingByTemplateReq, CreateTrainingByTemplateRes };
