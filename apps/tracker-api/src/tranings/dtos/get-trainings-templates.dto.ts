import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { TrainingDto } from './training.dto';

class TrainingTemplateDto extends OmitType(TrainingDto, [
  'startDate',
  'endDate',
] as const) {}

class GetTrainingsTemplatesResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingTemplateDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrainingTemplateDto)
  data: TrainingTemplateDto[];
}

export { GetTrainingsTemplatesResponse, TrainingTemplateDto };
