import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsISO8601, IsOptional } from 'class-validator';

class GetTrainingsQuery {
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

export { GetTrainingsQuery };
