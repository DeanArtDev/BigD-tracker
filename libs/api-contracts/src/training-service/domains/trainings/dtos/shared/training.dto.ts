import { Expose, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsISO8601, IsOptional, IsString } from 'class-validator';

enum TrainingType {
  LIGHT = 'LIGHT',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  MIXED = 'MIXED',
}

class TrainingDto {
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
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsISO8601()
  @IsString()
  startDate: string;

  @Expose()
  @IsISO8601()
  @IsOptional()
  @IsString()
  endDate?: string;

  @Expose()
  @IsOptional()
  @IsInt()
  wormUpDuration?: number;

  @Expose()
  @IsOptional()
  @IsInt()
  postTrainingDuration?: number;

  @Expose()
  @IsBoolean()
  inProgress: boolean;
}

export { TrainingType, TrainingDto };
