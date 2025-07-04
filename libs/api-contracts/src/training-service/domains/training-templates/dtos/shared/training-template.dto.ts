import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { TrainingType } from '../../../trainings';

class TrainingTemplateDto {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsInt()
  userId: number;

  @Expose()
  @Type(() => String)
  @IsEnum(TrainingType)
  type: TrainingType;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  @IsOptional()
  description?: string;

  @Expose()
  @IsInt()
  @IsOptional()
  wormUpDuration?: number;

  @Expose()
  @IsInt()
  @IsOptional()
  postTrainingDuration?: number;
}

export { TrainingTemplateDto };
