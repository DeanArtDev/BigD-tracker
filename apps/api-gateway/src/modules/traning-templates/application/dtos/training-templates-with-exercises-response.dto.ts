import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { TrainingTemplateWithExercisesDto } from './training-template-with-exercises.dto';

class TrainingTemplateWithExercisesResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingTemplateWithExercisesDto,
    isArray: true,
  })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => TrainingTemplateWithExercisesDto)
  @IsArray()
  data: TrainingTemplateWithExercisesDto[];
}

class TrainingTemplateWithExercisesResponseSingle {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingTemplateWithExercisesDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => TrainingTemplateWithExercisesDto)
  data: TrainingTemplateWithExercisesDto;
}

export { TrainingTemplateWithExercisesResponse, TrainingTemplateWithExercisesResponseSingle };
