import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsISO8601, IsOptional, ValidateNested } from 'class-validator';
import { ThingDto } from '../shared';

class GetThingsQuery {
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

class GetThingsApiGatewayRes {
  @ApiProperty({ description: 'Ответ сервера', type: ThingDto, isArray: true })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => ThingDto)
  @IsArray()
  data: ThingDto[];
}

export { GetThingsQuery, GetThingsApiGatewayRes };
