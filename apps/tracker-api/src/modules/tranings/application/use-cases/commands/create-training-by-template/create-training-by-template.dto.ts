import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsInt, IsISO8601, ValidateNested } from 'class-validator';

class CreateTrainingByTemplateRequestData {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  templateId: number;

  @ApiProperty({
    example: '2025-05-24T13:01:02.471Z',
  })
  @Expose()
  @IsISO8601()
  startDate: string;
}

class CreateTrainingByTemplateRequest {
  @ApiProperty({
    description: 'Данные для запроса',
    type: CreateTrainingByTemplateRequestData,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTrainingByTemplateRequestData)
  data: CreateTrainingByTemplateRequestData[];
}

export { CreateTrainingByTemplateRequest };
