import { RepetitionFinishType } from '../repetitions.repository';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

class RepetitionDto {
  @IsInt()
  @Expose()
  id: number;

  @IsInt()
  @IsOptional()
  userId?: number;

  @IsInt()
  @Expose()
  exerciseId: number;

  @IsString()
  @Expose()
  @IsOptional()
  @Type(() => String)
  @IsEnum(RepetitionFinishType)
  finishType?: RepetitionFinishType;

  @IsInt()
  @Expose()
  targetCount: number;

  @IsString()
  @Expose()
  targetWeight: string;

  @IsInt()
  @Expose()
  targetBreak: number;

  @IsString()
  @Expose()
  @IsOptional()
  factWeight?: string;

  @IsInt()
  @Expose()
  @IsOptional()
  factBreak?: number;

  @IsInt()
  @Expose()
  @IsOptional()
  factCount?: number;
}

export { RepetitionDto };
