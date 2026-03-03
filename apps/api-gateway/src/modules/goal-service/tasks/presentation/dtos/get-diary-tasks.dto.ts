import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsISO8601, IsOptional, ValidateNested } from 'class-validator';
import { TaskVirtualDto } from './task-virtual.dto';

class GetDiaryTasksFilterDto {
  @ApiProperty({
    description: 'Начало диапазона (ISO 8601). Должно приходить вместе с filter.to',
    example: '2026-01-01T00:00:00.000Z',
  })
  @Expose()
  @IsISO8601()
  from: string;

  @ApiProperty({
    description: 'Конец диапазона (ISO 8601). Должно приходить вместе с filter.from',
    example: '2026-02-01T00:00:00.000Z',
  })
  @Expose()
  @IsISO8601()
  to: string;
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
  @ApiProperty({ description: 'Ответ сервера', type: TaskVirtualDto, isArray: true })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => TaskVirtualDto)
  @IsArray()
  items: TaskVirtualDto[];
}

class GetDiaryTasksRes {
  @ApiProperty({ description: 'Ответ сервера', type: GetDiaryTasksResData })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => GetDiaryTasksResData)
  data: GetDiaryTasksResData;
}

export { GetDiaryTasksQuery, GetDiaryTasksRes };
