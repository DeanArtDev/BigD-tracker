import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsISO8601, IsOptional, IsString } from 'class-validator';
import { TrainingType } from '../entities/training.entity';

class TrainingDto {
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

  @ApiProperty({
    example: '2025-05-24T13:01:02.471Z',
  })
  @Expose()
  @IsISO8601()
  startDate: string;

  @ApiPropertyOptional({
    example: '2025-06-24T13:01:02.471Z',
  })
  @Expose()
  @IsISO8601()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    example: 300000,
    description: 'измеряется в миллисекундах',
  })
  @IsInt()
  @Expose()
  @IsOptional()
  wormUpDuration?: number;

  @ApiPropertyOptional({
    example: 300000,
    description: 'измеряется в миллисекундах',
  })
  @IsInt()
  @Expose()
  @IsOptional()
  postTrainingDuration?: number;

  @ApiProperty({
    example: '2025-05-24T13:01:02.471Z',
    description: 'ISO String',
  })
  @Expose()
  @IsISO8601()
  createdAt: string;

  @ApiProperty({
    example: '2025-05-24T13:01:02.471Z',
    description: 'ISO String',
  })
  @IsISO8601()
  @Expose()
  updatedAt: string;
}

export { TrainingDto };
