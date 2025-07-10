import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsInt, IsISO8601, IsOptional, IsString, Max, Min } from 'class-validator';

class ThingDto {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  id: number;

  @ApiProperty({ example: 'Имя дела' })
  @Expose()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Описание' })
  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  userId: number;

  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  groupId: number;

  @ApiPropertyOptional({ example: 2, description: 'От 0 до 4' })
  @Expose()
  @IsOptional()
  @Min(0)
  @Max(4)
  @IsInt()
  priority?: number;

  @ApiPropertyOptional({ example: '2025-05-24T13:01:02.471Z' })
  @IsISO8601()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-05-24T13:01:02.471Z' })
  @IsISO8601()
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ example: '2025-05-24T13:01:02.471Z' })
  @IsISO8601()
  @IsOptional()
  @IsString()
  deadline?: string;

  @ApiProperty({ example: 40, description: 'От 0 до 100' })
  @Expose()
  @Min(0)
  @Max(100)
  @IsInt()
  result: number;

  @ApiPropertyOptional({ example: 'Комментарий по завершению дела' })
  @Expose()
  @IsOptional()
  @IsString()
  comment?: string;
}

export { ThingDto };
