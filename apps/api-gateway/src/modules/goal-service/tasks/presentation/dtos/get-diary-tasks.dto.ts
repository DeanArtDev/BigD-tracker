import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsISO8601, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { TaskDto } from './task.dto';

class GetDiaryTasksFilterDto {
  @ApiProperty({
    description: 'Без времени, только день',
    example: '2026-01-01',
  })
  @Expose()
  @IsISO8601()
  from: string;

  @ApiProperty({
    description: 'Без времени, только день',
    example: '2026-01-01',
  })
  @Expose()
  @IsISO8601()
  to: string;

  @ApiPropertyOptional({
    description: 'IDs групп',
    type: Number,
    isArray: true,
    example: [1, 2, 3],
  })
  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  group?: number[];
}

class GetDiaryTasksQuery {
  @ApiPropertyOptional({
    description: 'Параметры фильтрации',
    type: GetDiaryTasksFilterDto,
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => GetDiaryTasksFilterDto)
  filter: GetDiaryTasksFilterDto;
}

class GetDiaryTasksResData {
  @ApiProperty({ description: 'Ответ сервера', type: TaskDto, isArray: true })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => TaskDto)
  @IsArray()
  items: TaskDto[];
}

class GetDiaryTasksRes {
  @ApiProperty({ description: 'Ответ сервера', type: GetDiaryTasksResData })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => GetDiaryTasksResData)
  data: GetDiaryTasksResData;
}

export { GetDiaryTasksQuery, GetDiaryTasksRes };
