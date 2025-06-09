import { TrainingAggregationDto } from './training-aggregation.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

class TrainingAggregationResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingAggregationDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrainingAggregationDto)
  data: TrainingAggregationDto[];
}

class TrainingAggregationResponseSingle {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingAggregationDto,
  })
  @Type(() => TrainingAggregationDto)
  data: TrainingAggregationDto;
}

export { TrainingAggregationResponse, TrainingAggregationResponseSingle };
