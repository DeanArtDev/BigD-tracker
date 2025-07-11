import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ExerciseWithRepetitionsDto } from './exercise-with-repetitions.dto';

class ExerciseWithRepetitionsResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: ExerciseWithRepetitionsDto,
    isArray: true,
  })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseWithRepetitionsDto)
  data: ExerciseWithRepetitionsDto[];
}

class ExerciseWithRepetitionsResponseSingle {
  @ApiProperty({
    description: 'Ответ сервера',
    type: ExerciseWithRepetitionsDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => ExerciseWithRepetitionsDto)
  data: ExerciseWithRepetitionsDto;
}

export { ExerciseWithRepetitionsResponseSingle, ExerciseWithRepetitionsResponse };
