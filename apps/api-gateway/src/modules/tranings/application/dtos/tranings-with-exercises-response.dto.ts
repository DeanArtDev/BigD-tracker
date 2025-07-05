import { TrainingWithExercisesDto } from './training-with-exercises.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';

class TrainingWithExercisesResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingWithExercisesDto,
    isArray: true,
  })
  @IsArray()
  @Type(() => TrainingWithExercisesDto)
  data: TrainingWithExercisesDto[];
}

class TrainingWithExercisesResponseSingle {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingWithExercisesDto,
  })
  @Type(() => TrainingWithExercisesDto)
  data: TrainingWithExercisesDto;
}

export { TrainingWithExercisesResponseSingle, TrainingWithExercisesResponse };
