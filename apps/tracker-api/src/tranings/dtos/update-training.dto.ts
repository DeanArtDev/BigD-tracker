import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';
import { AtLeastOneFieldExistsInDto } from '@shared/decorators/at-least-one-field-exists-in-dto';

class TrainingDto {
  @ApiProperty({
    example: 'Понедельничная',
  })
  @IsString()
  @Expose()
  @IsOptional()
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
  startDate: Date;

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

  @AtLeastOneFieldExistsInDto([
    'name',
    'description',
    'startDate',
    'endDate',
    'wormUpDuration',
    'postTrainingDuration',
  ])
  // eslint-disable-next-line
  _atLeastOne!: any;
}

class UpdateTrainingsDto {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingDto,
  })
  @ValidateNested()
  @Type(() => TrainingDto)
  data: TrainingDto;
}

