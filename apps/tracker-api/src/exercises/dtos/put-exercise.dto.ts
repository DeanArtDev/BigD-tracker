import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ExerciseDto } from './exercise.dto';

class PutExerciseDto extends OmitType(ExerciseDto, [
  'id',
  'userId',
  'createdAt',
] as const) {}

class PutExerciseRequest {
  @ApiProperty({
    description: 'Запрос к серверу',
    type: PutExerciseDto,
  })
  @ValidateNested()
  @Type(() => PutExerciseDto)
  data: PutExerciseDto;
}

class PutExerciseResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: ExerciseDto,
  })
  @ValidateNested()
  @Type(() => ExerciseDto)
  data: ExerciseDto;
}

export { PutExerciseRequest, PutExerciseResponse };
