import { CreateRepetitionDto } from '@/modules/repetitions';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateExerciseRequestData } from '../../../dtos/create-exercise.dto';

class CreateRepetition extends OmitType(CreateRepetitionDto, ['exerciseId'] as const) {}
class CreateExercise extends OmitType(CreateExerciseRequestData, [
  'trainingId',
  'templateId',
] as const) {}

class CreateExerciseWithRepetitionsData extends CreateExercise {
  @ApiProperty({
    description: 'Повторения',
    type: CreateRepetition,
    isArray: true,
  })
  @Expose()
  @IsArray()
  @Type(() => CreateRepetition)
  @ValidateNested({ each: true })
  repetitions: CreateRepetition[];
}

class CreateExerciseWithRepetitionsRequest {
  @ApiProperty({
    description: 'Данные для запроса',
    type: CreateExerciseWithRepetitionsData,
  })
  @ValidateNested()
  @Type(() => CreateExerciseWithRepetitionsData)
  data: CreateExerciseWithRepetitionsData;
}

export { CreateExerciseWithRepetitionsRequest, CreateExerciseWithRepetitionsData };
