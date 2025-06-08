import { RepetitionFinishType } from '@/repetitions/repetitions.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';

class RepetitionsDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Expose()
  id: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Expose()
  @IsOptional()
  userId?: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Expose()
  exerciseId: number;

  @ApiProperty({ example: 'MEDIUM', enum: RepetitionFinishType })
  @Type(() => String)
  @IsEnum(RepetitionFinishType)
  @Expose()
  finishType: RepetitionFinishType;

  @ApiProperty({ example: 1, description: 'Желаемое количество повторений' })
  @IsInt()
  @Expose()
  targetCount: number;

  @ApiPropertyOptional({ example: 1, description: 'Фактическое количество повторений' })
  @IsInt()
  @Expose()
  @IsOptional()
  factCount?: number;

  @ApiProperty({ example: 1, description: 'Желаемый вec' })
  @IsInt()
  @Expose()
  targetWeight: number;

  @ApiPropertyOptional({ example: 1, description: 'Фактический вec' })
  @IsInt()
  @Expose()
  @IsOptional()
  factWeight?: number;

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

export { RepetitionsDto };
