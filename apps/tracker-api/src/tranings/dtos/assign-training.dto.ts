import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInt, IsISO8601, ValidateNested } from 'class-validator';

class AssignTrainingDtoData {
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

class AssignTrainingRequest {
  @ApiProperty({
    description: 'Данные для запроса',
    type: AssignTrainingDtoData,
    isArray: true,
  })
  @ValidateNested({ each: true })
  @Type(() => AssignTrainingDtoData)
  data: AssignTrainingDtoData[];
}

export { AssignTrainingRequest, AssignTrainingDtoData };
