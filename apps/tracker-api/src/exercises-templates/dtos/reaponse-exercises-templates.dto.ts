import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';
import { ExerciseTemplateDto } from './exercise-template.dto';

class ExercisesTemplatesResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: ExerciseTemplateDto,
    isArray: true,
  })
  @IsArray()
  @Type(() => ExerciseTemplateDto)
  data: ExerciseTemplateDto[];
}

class ExercisesTemplatesResponseSingle {
  @ApiProperty({
    description: 'Ответ сервера',
    type: ExerciseTemplateDto,
  })
  @Type(() => ExerciseTemplateDto)
  data: ExerciseTemplateDto;
}

export { ExercisesTemplatesResponseSingle, ExercisesTemplatesResponse };
