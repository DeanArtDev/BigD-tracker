import { ExerciseTemplateDto } from './exercise-template.dto';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { AtLeastOneFieldExistsInDto } from '@shared/decorators/at-least-one-field-exists-in-dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

class PatchExerciseTemplateDto extends PartialType(
  OmitType(ExerciseTemplateDto, ['id', 'userId', 'createdAt'] as const),
) {
  @AtLeastOneFieldExistsInDto<PatchExerciseTemplateDto>([
    'type',
    'name',
    'description',
    'exampleUrl',
  ])
  _atLeastOne!: any;
}

class PatchExerciseTemplateRequest {
  @ApiProperty({
    description: 'Запрос к серверу',
    type: PatchExerciseTemplateDto,
  })
  @ValidateNested()
  @Type(() => PatchExerciseTemplateDto)
  data: PatchExerciseTemplateDto;
}

class PatchExerciseTemplateResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: ExerciseTemplateDto,
  })
  @ValidateNested()
  @Type(() => ExerciseTemplateDto)
  data: ExerciseTemplateDto;
}

export { PatchExerciseTemplateRequest, PatchExerciseTemplateResponse };
