import { ExerciseWithRepetitionsDto } from '@/modules/exercises';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { TrainingDto } from './training.dto';

class TrainingExerciseWithRepetitionsDto extends OmitType(ExerciseWithRepetitionsDto, [
  'trainingId',
  'templateId',
  'userId',
] as const) {}

class TrainingWithExercisesDto extends TrainingDto {
  @ApiProperty({
    description: 'Упражнения',
    type: TrainingExerciseWithRepetitionsDto,
    isArray: true,
  })
  @Expose()
  @Type(() => TrainingExerciseWithRepetitionsDto)
  @ValidateNested({ each: true })
  exercises: TrainingExerciseWithRepetitionsDto[];
}

export { TrainingWithExercisesDto };
