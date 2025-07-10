import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { GroupDto } from './group.dto';

class GoalDto {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  id: number;

  @ApiProperty({ example: 'Имя цели' })
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

  @ApiProperty({ example: 40, description: 'От 0 до 100' })
  @Expose()
  @Min(0)
  @Max(100)
  @IsInt()
  result: number;

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

  @ApiProperty({
    description: 'Список групп',
    type: GroupDto,
    isArray: true,
  })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => GroupDto)
  @IsArray()
  groups: GroupDto[];
}

export { GoalDto };
