import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AtLeastOneFieldExistsInDto } from '@shared/decorators/at-least-one-field-exists-in-dto';
import { TrainingDto } from './training.dto';
import { ValidateNested } from 'class-validator';

class PatchTrainingDto extends PartialType(
  OmitType(TrainingDto, ['id', 'userId'] as const),
) {
  @AtLeastOneFieldExistsInDto([
    'name',
    'type',
    'description',
    'startDate',
    'endDate',
    'wormUpDuration',
    'postTrainingDuration',
  ])
  _atLeastOne!: any;
}

class PatchTrainingRequest {
  @ApiProperty({
    description: 'Запрос к серверу',
    type: PatchTrainingDto,
  })
  @ValidateNested()
  @Type(() => PatchTrainingDto)
  data: PatchTrainingDto;
}

class PatchTrainingResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingDto,
  })
  @ValidateNested()
  @Type(() => TrainingDto)
  data: TrainingDto;
}

export { PatchTrainingResponse, PatchTrainingRequest };
