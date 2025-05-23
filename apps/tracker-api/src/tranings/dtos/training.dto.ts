import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';

enum TrainingType {
  LIGHT = 'LIGHT',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

class TrainingDto {
  @ApiProperty()
  @IsInt()
  @Expose()
  id: number;

  @ApiProperty()
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

  @ApiProperty({
    example: 'Thu May 15 2025 18:59:22 GMT+0000',
  })
  @Expose()
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @Transform(({ value }) => value?.toISOString(), { toPlainOnly: true })
  startDate?: Date;

  @ApiPropertyOptional({
    example: 'Thu May 15 2025 18:59:22 GMT+0000',
  })
  @Expose()
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @Transform(({ value }) => value?.toISOString(), { toPlainOnly: true })
  endDate?: Date;

  @ApiPropertyOptional({ example: 30000, description: 'измеряется в миллисекундах' })
  @IsInt()
  @Expose()
  @IsOptional()
  wormUpDuration?: number;

  @ApiPropertyOptional({ example: 30000, description: 'измеряется в миллисекундах' })
  @IsInt()
  @Expose()
  @IsOptional()
  postTrainingDuration?: number;

  @ApiProperty({
    example: 'Thu May 15 2025 18:59:22 GMT+0000',
  })
  @Expose()
  @IsDate()
  @Type(() => Date)
  @Transform(({ value }) => value?.toISOString(), { toPlainOnly: true })
  createdAt: Date;
}

export { TrainingDto, TrainingType };
