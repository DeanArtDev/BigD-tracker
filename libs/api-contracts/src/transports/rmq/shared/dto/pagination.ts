import { IsInt } from 'class-validator';

class PaginationQueryDto {
  @IsInt()
  page: number;

  @IsInt()
  perPage: number;
}

export { PaginationQueryDto };
