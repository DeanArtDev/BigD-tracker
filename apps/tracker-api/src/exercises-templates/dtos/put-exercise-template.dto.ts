import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ExerciseTemplateDto } from './exercise-template.dto';

class PutExerciseTemplateRequestData extends OmitType(ExerciseTemplateDto, [
  'id',
  'userId',
  'createdAt',
  'updatedAt',
  'repetitions',
] as const) {}

class PutExerciseTemplateRequest {
  @ApiProperty({
    description: 'Запрос к серверу',
    type: PutExerciseTemplateRequestData,
  })
  @ValidateNested()
  @Type(() => PutExerciseTemplateRequestData)
  data: PutExerciseTemplateRequestData;
}

export { PutExerciseTemplateRequest, PutExerciseTemplateRequestData };
