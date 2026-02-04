import { IsInt, IsOptional, IsString } from 'class-validator';

class CursorPaginationQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsInt()
  limit?: number;
}

export { CursorPaginationQueryDto };
