import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { TrainingTemplateDto } from './training-template.dto';

class PutTrainingTemplateDto extends OmitType(TrainingTemplateDto, [
  'id',
  'userId',
  'createdAt',
] as const) {}

class PutTrainingTemplateRequest {
  @ApiProperty({
    description: 'Запрос к серверу',
    type: PutTrainingTemplateDto,
  })
  @ValidateNested()
  @Type(() => PutTrainingTemplateDto)
  data: PutTrainingTemplateDto;
}

class PutTrainingTemplateResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingTemplateDto,
  })
  @ValidateNested()
  @Type(() => TrainingTemplateDto)
  data: TrainingTemplateDto;
}

export { PutTrainingTemplateResponse, PutTrainingTemplateRequest };
