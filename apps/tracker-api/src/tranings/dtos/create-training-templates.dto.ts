import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { TrainingTemplateDto } from './training-template.dto';

class TemplateRequest extends OmitType(TrainingTemplateDto, ['id', 'createdAt'] as const) {}

class CreateTrainingTemplateRequest {
  @ApiProperty({
    description: 'Данные для запроса',
    type: TemplateRequest,
  })
  @ValidateNested()
  @Type(() => TemplateRequest)
  data: TemplateRequest;
}

class CreateTrainingTemplateResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingTemplateDto,
  })
  @ValidateNested()
  @Type(() => TrainingTemplateDto)
  data: TrainingTemplateDto;
}

export { CreateTrainingTemplateResponse, CreateTrainingTemplateRequest };
