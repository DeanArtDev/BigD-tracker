import { UpdateRepetitionDto } from '@/repetitions';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateExerciseRequestData } from '../../../dtos/create-exercise.dto';

class UpdateRepetition extends OmitType(UpdateRepetitionDto, ['exerciseId', 'id'] as const) {}

class UpdateExerciseWithRepetitionsData extends CreateExerciseRequestData {
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
