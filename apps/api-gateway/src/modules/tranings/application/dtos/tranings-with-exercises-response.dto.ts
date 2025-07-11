import { TrainingWithExercisesDto } from './training-with-exercises.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

class TrainingWithExercisesResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingWithExercisesDto,
    isArray: true,
  })
  @Expose()
  @Type(() => TrainingWithExercisesDto)
  @ValidateNested({ each: true })
  @IsArray()
  data: TrainingWithExercisesDto[];
}

class TrainingWithExercisesResponseSingle {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingWithExercisesDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => TrainingWithExercisesDto)
  data: TrainingWithExercisesDto;
}

export { TrainingWithExercisesResponseSingle, TrainingWithExercisesResponse };
