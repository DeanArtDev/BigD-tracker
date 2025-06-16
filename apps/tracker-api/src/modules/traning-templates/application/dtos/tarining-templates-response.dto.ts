import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { TrainingTemplateDto } from './training-template.dto';

class TrainingTemplateResponse {
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

class TrainingTemplateResponseSingle {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingTemplateDto,
  })
  @Type(() => TrainingTemplateDto)
  data: TrainingTemplateDto;
}

export { TrainingTemplateResponse, TrainingTemplateResponseSingle };
