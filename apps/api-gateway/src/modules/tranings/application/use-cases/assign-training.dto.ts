import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsInt, IsISO8601, ValidateNested } from 'class-validator';

class AssignTrainingRequestData {
  @ApiProperty({
    example: 1,
  })
  @Expose()
  @IsInt()
  id: number;

  @ApiProperty({
    example: '2025-05-24T13:01:02.471Z',
  })
  @Expose()
  @IsISO8601()
  startDate: string;
}

class AssignTrainingRequest {
  @ApiProperty({
    description: 'Данные для запроса',
    type: AssignTrainingRequestData,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignTrainingRequestData)
  data: AssignTrainingRequestData[];
}

export { AssignTrainingRequest, AssignTrainingRequestData };
