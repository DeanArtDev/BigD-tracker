import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsISO8601, IsOptional, ValidateNested } from 'class-validator';
import { TrainingDto } from './training.dto';

class GetTrainingsFilters {
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

class GetTrainingsResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TrainingDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrainingDto)
  data: TrainingDto[];
}

export { GetTrainingsResponse, GetTrainingsFilters };
