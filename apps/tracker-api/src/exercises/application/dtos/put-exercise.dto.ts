import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ExerciseDto } from './exercise.dto';

class PutExerciseRequestData extends OmitType(ExerciseDto, ['userId'] as const) {}

class PutExerciseRequest {
  @ApiProperty({
    description: 'Запрос к серверу',
    type: PutExerciseRequestData,
  })
  @ValidateNested()
  @Type(() => PutExerciseRequestData)
  data: PutExerciseRequestData;
}

export { PutExerciseRequest, PutExerciseRequestData };
