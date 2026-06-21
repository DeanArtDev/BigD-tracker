import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

class CursorPaginationDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsInt()
  limit: number;
}

class CursorPaginationMetaDto {
  @IsOptional()
  @IsString()
  endCursor?: string;

  @IsBoolean()
  hasNextPage: boolean;
}

export { CursorPaginationDto, CursorPaginationMetaDto };
