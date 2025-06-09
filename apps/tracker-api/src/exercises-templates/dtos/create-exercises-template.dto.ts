import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ExerciseTemplateDto } from './exercise-template.dto';

class CreateExerciseTemplateRequestData extends OmitType(ExerciseTemplateDto, [
  'id',
  'createdAt',
  'updatedAt',
  'userId',
  'repetitions',
] as const) {}

class CreateExerciseTemplateRequest {
  @ApiProperty({
    description: 'Данные для запроса',
    type: CreateExerciseTemplateRequestData,
  })
  @ValidateNested()
  @Type(() => CreateExerciseTemplateRequestData)
  data: CreateExerciseTemplateRequestData;
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

export {
  CreateExerciseTemplateRequest,
  CreateExerciseTemplateResponse,
  CreateExerciseTemplateRequestData,
};
