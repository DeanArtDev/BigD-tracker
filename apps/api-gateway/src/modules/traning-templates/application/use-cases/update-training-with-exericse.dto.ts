import { UpdateExerciseWithRepetitionsData } from '@/modules/exercises/application/use-cases';
import { TrainingType } from '@big-d/api-contracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

class TemplateExerciseWithRepetitions extends UpdateExerciseWithRepetitionsData {
  @ApiProperty({
    example: 1,
  })
  @Expose()
  @IsInt()
  id: number;
}

class UpdateTrainingTemplateWithExerciseRequestData {
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

  @ApiProperty({ type: TemplateExerciseWithRepetitions, isArray: true })
  @IsArray()
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => TemplateExerciseWithRepetitions)
  exercises: TemplateExerciseWithRepetitions[];
}

class UpdateTrainingTemplateWithExerciseRequest {
  @ApiProperty({
    description: 'Данные для запроса',
    type: UpdateTrainingTemplateWithExerciseRequestData,
  })
  @ValidateNested()
  @Type(() => UpdateTrainingTemplateWithExerciseRequestData)
  data: UpdateTrainingTemplateWithExerciseRequestData;
}

export { UpdateTrainingTemplateWithExerciseRequestData, UpdateTrainingTemplateWithExerciseRequest };
