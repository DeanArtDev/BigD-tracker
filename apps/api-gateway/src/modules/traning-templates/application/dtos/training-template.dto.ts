import { TrainingType } from '@big-d/api-contracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

class TrainingTemplateDto {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  id: number;

  @ApiProperty({ example: 1 })
  @Expose()
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiProperty({ example: 'MEDIUM', enum: TrainingType })
  @Expose()
  @Type(() => String)
  @IsEnum(TrainingType)
  type: TrainingType;

  @ApiProperty({ example: 'Понедельничная' })
  @Expose()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'описание (какие цели на тренировку, на что сделать упор и т.п)',
  })
  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 30,
    description: 'измеряется в минутах',
  })
  @Expose()
  @IsOptional()
  @IsInt()
  wormUpDuration?: number;

  @ApiPropertyOptional({
    example: 30,
    description: 'измеряется в минутах',
  })
  @Expose()
  @IsOptional()
  @IsInt()
  postTrainingDuration?: number;
}

export { TrainingTemplateDto };
