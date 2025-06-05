import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ExerciseTemplateDto } from './exercise-template.dto';

class CreateExerciseTemplateDto extends OmitType(ExerciseTemplateDto, [
  'id',
  'createdAt',
  'updatedAt',
  'userId',
] as const) {}

class CreateExerciseTemplateRequest {
  @ApiProperty({
    description: 'Данные для запроса',
    type: CreateExerciseTemplateDto,
  })
  @ValidateNested()
  @Type(() => CreateExerciseTemplateDto)
  data: CreateExerciseTemplateDto;
}

class CreateExerciseTemplateResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: ExerciseTemplateDto,
  })
  @ValidateNested()
  @Type(() => ExerciseTemplateDto)
  data: ExerciseTemplateDto;
}

export { CreateExerciseTemplateRequest, CreateExerciseTemplateResponse };
