import { CreateExerciseWithRepetitionsData } from '@/modules/exercises';
import { TrainingType } from '../../../trainings.repository';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class CreateTrainingWithExercisesRequestData {
  @ApiProperty({ example: 'MEDIUM', enum: TrainingType })
  @Type(() => String)
  @IsEnum(TrainingType)
  @Expose()
  type: TrainingType;

  @ApiProperty({ type: CreateExerciseWithRepetitionsData, isArray: true })
  @IsArray()
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseWithRepetitionsData)
  exercises: CreateExerciseWithRepetitionsData[];

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

class CreateTrainingWithExercisesRequest {
  @ApiProperty({
    description: 'Данные для запроса',
    type: CreateTrainingWithExercisesRequestData,
  })
  @ValidateNested()
  @Type(() => CreateTrainingWithExercisesRequestData)
  data: CreateTrainingWithExercisesRequestData;
}

export { CreateTrainingWithExercisesRequest };
