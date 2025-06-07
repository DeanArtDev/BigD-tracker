import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInt, IsISO8601, ValidateNested } from 'class-validator';

class AssignTrainingAggregationDtoData {
  @ApiProperty({
    example: 1,
  })
  @Expose()
  @IsInt()
  trainingId: number;

  @ApiProperty({
    example: '2025-05-24T13:01:02.471Z',
  })
  @Expose()
  @IsISO8601()
  startDate: string;
}

class AssignTrainingAggregationRequest {
  @ApiProperty({
    description: 'Данные для запроса',
    type: AssignTrainingAggregationDtoData,
    isArray: true,
  })
  @ValidateNested({ each: true })
  @Type(() => AssignTrainingAggregationDtoData)
  data: AssignTrainingAggregationDtoData[];
}

export { AssignTrainingAggregationRequest, AssignTrainingAggregationDtoData };
