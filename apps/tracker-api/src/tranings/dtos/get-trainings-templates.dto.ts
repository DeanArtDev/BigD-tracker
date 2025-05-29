import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString } from '@shared/decorators/is-boolean-string';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { TrainingTemplateDto } from './training-template.dto';

class GetTrainingsTemplatesQuery {
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Expose()
  @IsBooleanString()
  my?: boolean;
}

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

export { GetTrainingsTemplatesResponse, GetTrainingsTemplatesQuery };
