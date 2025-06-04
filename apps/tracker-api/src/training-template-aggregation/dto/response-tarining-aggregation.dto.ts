import { TrainingTemplateAggregationDto } from './training-template-aggregation.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

class TrainingTemplateAggregationResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingTemplateAggregationDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrainingTemplateAggregationDto)
  data: TrainingTemplateAggregationDto[];
}

export { TrainingTemplateAggregationResponse };
