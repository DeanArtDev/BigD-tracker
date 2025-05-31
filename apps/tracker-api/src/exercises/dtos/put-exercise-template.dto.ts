import { ExerciseTemplateDto } from '@/exercises/dtos/exercise-template.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

class PutExerciseTemplateDto extends OmitType(ExerciseTemplateDto, [
  'id',
  'userId',
  'createdAt',
] as const) {}

class PutExerciseTemplateRequest {
  @ApiProperty({
    description: 'Запрос к серверу',
    type: PutExerciseTemplateDto,
  })
  @ValidateNested()
  @Type(() => PutExerciseTemplateDto)
  data: PutExerciseTemplateDto;
}

class PutExerciseTemplateResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: ExerciseTemplateDto,
  })
  @ValidateNested()
  @Type(() => ExerciseTemplateDto)
  data: ExerciseTemplateDto;
}

export { PutExerciseTemplateRequest, PutExerciseTemplateResponse };
