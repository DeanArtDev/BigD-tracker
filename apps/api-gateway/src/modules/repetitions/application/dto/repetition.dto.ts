import { RepetitionFinishType } from '@big-d/api-contracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

class RepetitionDto {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  id: number;

  @ApiPropertyOptional({ example: 1 })
  @Expose()
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  exerciseId: number;

  @ApiPropertyOptional({ example: 'SKIP', enum: RepetitionFinishType })
  @Expose()
  @IsEnum(RepetitionFinishType)
  @IsOptional()
  @Type(() => String)
  finishType?: RepetitionFinishType;

  @ApiProperty({ example: 1, description: 'Желаемое количество повторений' })
  @Expose()
  @IsInt()
  targetCount: number;

  @ApiPropertyOptional({ example: 1, description: 'Фактическое количество повторений' })
  @IsInt()
  @IsOptional()
  @Expose()
  factCount?: number;

  @ApiProperty({ example: '20.5', description: 'Желаемый вec' })
  @Expose()
  @IsString()
  targetWeight: string;

  @ApiPropertyOptional({ example: '100.7', description: 'Фактический вec' })
  @Expose()
  @IsOptional()
  @IsString()
  factWeight?: string;

  @ApiProperty({ example: 1, description: 'Желаемый перерыв, значение в секундах' })
  @Expose()
  @IsInt()
  targetBreak: number;

  @ApiPropertyOptional({ example: 1, description: 'Фактический перерыв, значение в секундах' })
  @Expose()
  @IsOptional()
  @IsInt()
  factBreak?: number;
}

export { RepetitionDto };
