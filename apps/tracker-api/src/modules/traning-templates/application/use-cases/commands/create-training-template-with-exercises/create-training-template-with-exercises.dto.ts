import { CreateExerciseWithRepetitionsData } from '@/modules/exercises';
import { TrainingType } from '@/modules/tranings';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

class CreateTrainingTemplateWithExercisesRequestData {
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

  @ApiProperty({ type: CreateExerciseWithRepetitionsData, isArray: true })
  @IsArray()
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseWithRepetitionsData)
  exercises: CreateExerciseWithRepetitionsData[];
}

class CreateTrainingTemplateWithExercisesRequest {
  @ApiProperty({
    description: 'Данные для запроса',
    type: CreateTrainingTemplateWithExercisesRequestData,
  })
  @ValidateNested()
  @Type(() => CreateTrainingTemplateWithExercisesRequestData)
  data: CreateTrainingTemplateWithExercisesRequestData;
}

export { CreateTrainingTemplateWithExercisesRequest, CreateExerciseWithRepetitionsData };
