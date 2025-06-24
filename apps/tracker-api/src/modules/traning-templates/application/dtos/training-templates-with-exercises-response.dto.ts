import { TrainingTemplateWithExercisesDto } from './training-template-with-exercises.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { TrainingTemplateDto } from './training-template.dto';

class TrainingTemplateWithExercisesResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingTemplateWithExercisesDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrainingTemplateWithExercisesDto)
  data: TrainingTemplateWithExercisesDto[];
}

class TrainingTemplateWithExercisesResponseSingle {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingTemplateWithExercisesDto,
  })
  @Type(() => TrainingTemplateDto)
  data: TrainingTemplateWithExercisesDto;
}

export { TrainingTemplateWithExercisesResponse, TrainingTemplateWithExercisesResponseSingle };
