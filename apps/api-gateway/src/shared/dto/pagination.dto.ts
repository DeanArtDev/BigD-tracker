import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsBoolean, IsInt } from 'class-validator';

class PaginationQueryDto {
  @ApiProperty({
    example: '1',
    description: 'Какая страниц',
  })
  @Expose()
  @Type(() => Number)
  @IsInt()
  page: number;

  @ApiProperty({
    example: '10',
    description: 'Элементов в странице',
  })
  @Expose()
  @Type(() => Number)
  @IsInt()
  perPage: number;
}

class PaginationResDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Наличие следующей страницы',
  })
  @Expose()
  @IsBoolean()
  nextPage: boolean;
}

export { PaginationQueryDto, PaginationResDto };
