import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsISO8601, IsOptional, ValidateNested } from 'class-validator';
import { TrainingAggregationDto } from './training-aggregation.dto';

class GetTrainingsAggregationFilters {
  @ApiPropertyOptional({
    example: '2025-05-24T13:01:02.471Z',
    description: 'ISO String',
  })
  @Expose()
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiPropertyOptional({
    example: '2025-05-24T13:01:02.471Z',
    description: 'ISO String',
  })
  @Expose()
  @IsOptional()
  @IsISO8601()
  to?: string;
}

class GetTrainingAggregationResponse {
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

export { GetTrainingAggregationResponse, GetTrainingsAggregationFilters };
