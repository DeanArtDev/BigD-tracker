import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ExerciseTemplateDto } from './exercise-template.dto';

class ExercisesTemplatesResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: ExerciseTemplateDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseTemplateDto)
  data: ExerciseTemplateDto[];
}

class ExercisesTemplatesResponseSingle {
  @ApiProperty({
    description: 'Ответ сервера',
    type: ExerciseTemplateDto,
  })
  @ValidateNested()
  @Type(() => ExerciseTemplateDto)
  data: ExerciseTemplateDto;
}

export { ExercisesTemplatesResponseSingle, ExercisesTemplatesResponse };
