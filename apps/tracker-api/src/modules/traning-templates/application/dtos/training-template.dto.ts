import { TrainingType } from '@/modules/tranings';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

class TrainingTemplateDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Expose()
  id: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Expose()
  userId: number;

  @ApiProperty({ example: 'MEDIUM', enum: TrainingType })
  @Type(() => String)
  @IsEnum(TrainingType)
  @Expose()
  type: TrainingType;

  @ApiProperty({
    example: 'Понедельничная',
  })
  @IsString()
  @Expose()
  name: string;

  @ApiPropertyOptional({
    example: 'описание (какие цели на тренировку, на что сделать упор и т.п)',
  })
  @IsString()
  @Expose()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 30,
    description: 'измеряется в минутах',
  })
  @IsInt()
  @Expose()
  @IsOptional()
  wormUpDuration?: number;

  @ApiPropertyOptional({
    example: 30,
    description: 'измеряется в минутах',
  })
  @IsInt()
  @Expose()
  @IsOptional()
  postTrainingDuration?: number;
}

export { TrainingTemplateDto };
