import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { ThingDto } from './thing.dto';

class GroupDto {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  id: number;

  @ApiProperty({ example: 'Группа дел' })
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

  @ApiPropertyOptional({ example: 1 })
  @Expose()
  @IsOptional()
  @IsInt()
  goalId?: number;

  @ApiProperty({ example: 40, description: 'От 0 до 100' })
  @Expose()
  @Min(0)
  @Max(100)
  @IsInt()
  result: number;

  @ApiProperty({
    description: 'Список дел',
    type: ThingDto,
    isArray: true,
  })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => ThingDto)
  @IsArray()
  things: ThingDto[];
}

export { GroupDto };
