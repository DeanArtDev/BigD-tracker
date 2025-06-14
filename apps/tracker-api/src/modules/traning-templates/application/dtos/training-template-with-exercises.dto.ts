import { ExerciseWithRepetitionsDto } from '@/modules/exercises';
import { TrainingTemplateDto } from './training-template.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

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
  @Type(() => TrainingTemplateExerciseDto)
  @ValidateNested({ each: true })
  exercises: TrainingTemplateExerciseDto[];
}

export { TrainingTemplateWithExercisesDto };
