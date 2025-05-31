import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ExerciseTemplateDto } from './exercise-template.dto';

class GetExercisesTemplatesResponse {
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

export { GetExercisesTemplatesResponse };
