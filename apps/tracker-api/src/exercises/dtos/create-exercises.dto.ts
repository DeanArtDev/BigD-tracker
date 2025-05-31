import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ExerciseDto } from './exercise.dto';

class CreateExerciseDto extends OmitType(ExerciseDto, ['id', 'createdAt'] as const) {}

class CreateExerciseRequest {
  @ApiProperty({
    description: 'Данные для запроса',
    type: CreateExerciseDto,
  })
  @ValidateNested()
  @Type(() => CreateExerciseDto)
  data: CreateExerciseDto;
}

class CreateExerciseResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: ExerciseDto,
  })
  @ValidateNested()
  @Type(() => ExerciseDto)
  data: ExerciseDto;
}

export { CreateExerciseRequest, CreateExerciseResponse };
