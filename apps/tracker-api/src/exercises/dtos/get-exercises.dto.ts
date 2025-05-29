import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ExerciseDto } from './exercise.dto';

class GetExercisesResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: ExerciseDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseDto)
  data: ExerciseDto[];
}

export { GetExercisesResponse };
