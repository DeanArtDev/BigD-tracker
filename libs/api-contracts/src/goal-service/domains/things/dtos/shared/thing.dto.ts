import { Expose } from 'class-transformer';
import { IsInt, IsISO8601, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

class ThingDto {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @MaxLength(255)
  @IsString()
  name: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsInt()
  userId: number;

  @Expose()
  @IsOptional()
  @IsInt()
  groupId?: number;

  @Expose()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  priority?: number;

  @Expose()
  @IsISO8601()
  @IsString()
  @IsOptional()
  startDate?: string;

  @Expose()
  @IsISO8601()
  @IsString()
  @IsOptional()
  endDate?: string;

  @Expose()
  @IsISO8601()
  @IsString()
  @IsOptional()
  deadline?: string;

  @Expose()
  @IsInt()
  @Min(0)
  @Max(100)
  result: number;

  @Expose()
  @IsOptional()
  @IsString()
  comment?: string;
}

export { ThingDto };
