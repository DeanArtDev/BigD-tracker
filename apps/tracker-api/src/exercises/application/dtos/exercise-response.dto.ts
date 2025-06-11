import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';
import { ExerciseDto } from './exercise.dto';

class ExerciseResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: ExerciseDto,
    isArray: true,
  })
  @IsArray()
  @Type(() => ExerciseDto)
  data: ExerciseDto[];
}

class ExerciseResponseSingle {
  @ApiProperty({
    description: 'Ответ сервера',
    type: ExerciseDto,
  })
  @Type(() => ExerciseDto)
  data: ExerciseDto;
}

export { ExerciseResponseSingle, ExerciseResponse };
