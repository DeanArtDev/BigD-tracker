import { UpdateExerciseWithRepetitionsData } from '@/modules/exercises';
import { TrainingType } from '../../../trainings.repository';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

class ExerciseWithRepetitionsRequestData extends UpdateExerciseWithRepetitionsData {
  @ApiProperty({
    example: 1,
  })
  @Expose()
  @IsInt()
  id: number;
}

class UpdateTrainingWithExerciseRequestData {
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

  @ApiProperty({ type: ExerciseWithRepetitionsRequestData, isArray: true })
  @IsArray()
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => ExerciseWithRepetitionsRequestData)
  exercises: ExerciseWithRepetitionsRequestData[];
}

class UpdateTrainingWithExerciseRequest {
  @ApiProperty({
    description: 'Данные для запроса',
    type: UpdateTrainingWithExerciseRequestData,
  })
  @ValidateNested()
  @Type(() => UpdateTrainingWithExerciseRequestData)
  data: UpdateTrainingWithExerciseRequestData;
}

export { UpdateTrainingWithExerciseRequestData, UpdateTrainingWithExerciseRequest };
