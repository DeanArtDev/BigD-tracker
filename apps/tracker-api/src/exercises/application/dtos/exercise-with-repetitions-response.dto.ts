import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';
import { ExerciseWithRepetitionsDto } from './exercise-with-repetitions.dto';

class ExerciseWithRepetitionsResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: ExerciseWithRepetitionsDto,
    isArray: true,
  })
  @IsArray()
  @Type(() => ExerciseWithRepetitionsDto)
  data: ExerciseWithRepetitionsDto[];
}

class ExerciseWithRepetitionsResponseSingle {
  @ApiProperty({
    description: 'Ответ сервера',
    type: ExerciseWithRepetitionsDto,
  })
  @Type(() => ExerciseWithRepetitionsDto)
  data: ExerciseWithRepetitionsDto;
}

export { ExerciseWithRepetitionsResponseSingle, ExerciseWithRepetitionsResponse };
