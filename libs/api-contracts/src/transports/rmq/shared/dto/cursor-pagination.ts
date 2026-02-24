import { IsInt, IsOptional, IsString } from 'class-validator';

class CursorPaginationQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsInt()
  limit: number;
}

export { CursorPaginationQueryDto };
