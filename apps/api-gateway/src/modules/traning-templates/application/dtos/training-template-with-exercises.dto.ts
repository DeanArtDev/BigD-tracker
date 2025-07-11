import { ExerciseWithRepetitionsDto } from '@/modules/exercises';
import { TrainingTemplateDto } from './training-template.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

class TrainingTemplateExerciseDto extends OmitType(ExerciseWithRepetitionsDto, [
  'trainingId',
  'templateId',
  'userId',
] as const) {}

class TrainingTemplateWithExercisesDto extends TrainingTemplateDto {
  @ApiProperty({
    description: 'Упражнения',
    type: TrainingTemplateExerciseDto,
    isArray: true,
  })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => TrainingTemplateExerciseDto)
  @IsArray()
  exercises: TrainingTemplateExerciseDto[];
}

export { TrainingTemplateWithExercisesDto };
