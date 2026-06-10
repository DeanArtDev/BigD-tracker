import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

class CursorPaginationQueryDto {
  @ApiPropertyOptional({
    example: 'eyJsYXN0SWQiOjEyMywic29ydCI6ImNyZWF0ZWRfYXQiLCJvcmRlc',
    description: 'Курсор пагинации',
  })
  @Expose()
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({
    example: '10',
    description: 'Шаг пагинации',
  })
  @Expose()
  @Type(() => Number)
  @IsInt()
  limit: number;
}

class CursorPaginationResDto {
  @ApiPropertyOptional({
    example: 'eyJsYXN0SWQiOjEyMywic29ydCI6ImNyZWF0ZWRfYXQiLCJvcmRlc',
    description: 'Курсор пагинации',
  })
  @Expose()
  @IsOptional()
  @IsString()
  endCursor?: string;

  @Expose()
  @IsBoolean()
  hasNextPage: boolean;
}

export { CursorPaginationQueryDto, CursorPaginationResDto };
