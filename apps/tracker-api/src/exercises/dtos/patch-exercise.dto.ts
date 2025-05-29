import { ExerciseDto } from './exercise.dto';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { AtLeastOneFieldExistsInDto } from '@shared/decorators/at-least-one-field-exists-in-dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

class PatchExerciseDto extends PartialType(
  OmitType(ExerciseDto, ['id', 'userId', 'createdAt'] as const),
) {
  @AtLeastOneFieldExistsInDto<PatchExerciseDto>([
    'trainingId',
    'type',
    'name',
    'description',
    'exampleUrl',
  ])
  _atLeastOne!: any;
}

class PatchExerciseRequest {
  @ApiProperty({
    description: 'Запрос к серверу',
    type: PatchExerciseDto,
  })
  @ValidateNested()
  @Type(() => PatchExerciseDto)
  data: PatchExerciseDto;
}

class PatchExerciseResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: ExerciseDto,
  })
  @ValidateNested()
  @Type(() => ExerciseDto)
  data: ExerciseDto;
}

export { PatchExerciseResponse, PatchExerciseRequest };
