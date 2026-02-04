import { TaskDto } from '@/modules/goal-service/tasks';
import { GroupStatus } from '@big-d/api-contracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class GroupDetailedDto {
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

  @ApiProperty({ example: 40, description: 'От 0 до 100' })
  @Expose()
  @Min(0)
  @Max(100)
  @IsNumber()
  progress: number;

  @ApiProperty({
    example: GroupStatus.NOT_STARTED,
    description: 'Статус группы',
    enum: GroupStatus,
  })
  @Expose()
  @IsEnum(GroupStatus)
  status: GroupStatus;

  @ApiProperty({
    description: 'Список дел',
    type: TaskDto,
    isArray: true,
  })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => TaskDto)
  @IsArray()
  tasks: TaskDto[];
}

export { GroupDetailedDto };
