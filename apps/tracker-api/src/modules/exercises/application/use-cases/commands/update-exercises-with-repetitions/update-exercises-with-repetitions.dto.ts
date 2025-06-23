import { ExerciseDto } from '../../../dtos/exercise.dto';
import { UpdateRepetitionDto } from '@/modules/repetitions';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInt, IsOptional, ValidateNested } from 'class-validator';

class UpdateRepetition extends OmitType(UpdateRepetitionDto, ['exerciseId', 'id'] as const) {
  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  @Expose()
  id?: number;
}

class UpdateExerciseWithRepetitionsData extends OmitType(ExerciseDto, [
  'id',
  'templateId',
  'trainingId',
  'userId',
] as const) {
  @ApiProperty({
    description: 'Повторения',
    type: UpdateRepetition,
    isArray: true,
  })
  @Expose()
  @Type(() => UpdateRepetition)
  @ValidateNested({ each: true })
  repetitions: UpdateRepetition[];
}

class UpdateExerciseWithRepetitionsRequest {
  @ApiProperty({
    description: 'Данные для запроса',
    type: UpdateExerciseWithRepetitionsData,
  })
  @ValidateNested()
  @Type(() => UpdateExerciseWithRepetitionsData)
  data: UpdateExerciseWithRepetitionsData;
}

export { UpdateExerciseWithRepetitionsRequest, UpdateExerciseWithRepetitionsData };
