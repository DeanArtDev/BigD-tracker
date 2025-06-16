import { RepetitionFinishType } from '../repetitions.repository';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

class RepetitionDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Expose()
  id: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  userId?: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  exerciseId: number;

  @ApiPropertyOptional({
    example: 'описание как прошел подход',
  })
  @IsString()
  @Expose()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'SKIP', enum: RepetitionFinishType })
  @Type(() => String)
  @IsEnum(RepetitionFinishType)
  @IsOptional()
  @Expose()
  finishType?: RepetitionFinishType;

  @ApiProperty({ example: 1, description: 'Желаемое количество повторений' })
  @IsInt()
  @Expose()
  targetCount: number;

  @ApiPropertyOptional({ example: 1, description: 'Фактическое количество повторений' })
  @IsInt()
  @Expose()
  @IsOptional()
  factCount?: number;

  @ApiProperty({ example: '20.5', description: 'Желаемый вec' })
  @IsString()
  @Expose()
  targetWeight: string;

  @ApiPropertyOptional({ example: '100.7', description: 'Фактический вec' })
  @IsString()
  @Expose()
  @IsOptional()
  factWeight?: string;

  @ApiProperty({ example: 1, description: 'Желаемый перерыв, значение в секундах' })
  @IsInt()
  @Expose()
  targetBreak: number;

  @ApiPropertyOptional({ example: 1, description: 'Фактический перерыв, значение в секундах' })
  @IsInt()
  @Expose()
  @IsOptional()
  factBreak?: number;
}

export { RepetitionDto };
