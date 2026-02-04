import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

class CursorPaginationQueryDto {
  @ApiPropertyOptional({
    example: 'eyJsYXN0SWQiOjEyMywic29ydCI6ImNyZWF0ZWRfYXQiLCJvcmRlc',
    description: 'Курсор пагинации',
  })
  @Expose()
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    example: '10',
    description: 'Шаг пагинации',
  })
  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}

class CursorPaginationResDto {
  @ApiPropertyOptional({
    example: 'eyJsYXN0SWQiOjEyMywic29ydCI6ImNyZWF0ZWRfYXQiLCJvcmRlc',
    description: 'Курсор пагинации',
  })
  @Expose()
  @IsOptional()
  @IsString()
  cursor?: string;
}

export { CursorPaginationQueryDto, CursorPaginationResDto };
