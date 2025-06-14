import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ExerciseDto } from './exercise.dto';

class CreateExerciseRequestData extends OmitType(ExerciseDto, ['id', 'userId'] as const) {}

class CreateExerciseRequest {
  @ApiProperty({
    description: 'Данные для запроса',
    type: CreateExerciseRequestData,
  })
  @ValidateNested()
  @Type(() => CreateExerciseRequestData)
  data: CreateExerciseRequestData;
}

export { CreateExerciseRequest, CreateExerciseRequestData };
