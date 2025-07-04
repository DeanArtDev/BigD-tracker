import { RepetitionFinishType } from '../repetitions.repository';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

class CreateRepetitionDto {
  @IsInt()
  @Expose()
  exerciseId: number;

  @IsString()
  @Expose()
  @IsOptional()
  description?: string;

  @Type(() => String)
  @IsEnum(RepetitionFinishType)
  @IsOptional()
  @Expose()
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
}

export { CreateRepetitionDto };
