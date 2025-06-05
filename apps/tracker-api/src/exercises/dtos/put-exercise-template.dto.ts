import { ExerciseTemplateDto } from '@/exercises/dtos/exercise-template.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

class PutExerciseTemplateRequestData extends OmitType(ExerciseTemplateDto, [
  'userId',
  'createdAt',
  'updatedAt',
] as const) {}

class PutExerciseTemplateRequest {
  @ApiProperty({
    description: 'Запрос к серверу',
    type: PutExerciseTemplateRequestData,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PutExerciseTemplateRequestData)
  data: PutExerciseTemplateRequestData[];
}

export { PutExerciseTemplateRequest };
