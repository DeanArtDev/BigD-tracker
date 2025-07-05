import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { TrainingDto } from './training.dto';

class TrainingRes {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrainingDto)
  data: TrainingDto[];
}

class TrainingResSingle {
  @Expose()
  @ValidateNested()
  @Type(() => TrainingDto)
  data: TrainingDto;
}

export { TrainingRes, TrainingResSingle };
