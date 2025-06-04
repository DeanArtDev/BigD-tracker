import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInt, IsISO8601, ValidateNested } from 'class-validator';

class AssignTrainingTemplateDtoData {
  @ApiProperty({
    example: 1,
  })
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

class AssignTrainingTemplateRequest {
  @ApiProperty({
    description: 'Данные для запроса',
    type: AssignTrainingTemplateDtoData,
    isArray: true,
  })
  @ValidateNested({ each: true })
  @Type(() => AssignTrainingTemplateDtoData)
  data: AssignTrainingTemplateDtoData[];
}

export { AssignTrainingTemplateDtoData, AssignTrainingTemplateRequest };
