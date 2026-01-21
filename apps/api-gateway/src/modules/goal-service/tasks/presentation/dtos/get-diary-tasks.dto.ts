import { TaskDto } from './task.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsISO8601, IsOptional, ValidateNested } from 'class-validator';

class GetDiaryTasksQuery {
  @ApiPropertyOptional({
    example: '2026-05-24T13:01:02.471Z',
    description: 'ISO String',
  })
  @Expose()
  @IsOptional()
  @IsISO8601()
  from: string;

  @ApiPropertyOptional({
    example: '2026-05-24T13:01:02.471Z',
    description: 'ISO String',
  })
  @Expose()
  @IsOptional()
  @IsISO8601()
  to: string;
}

class GetDiaryTasksRes {
  @ApiProperty({ description: 'Ответ сервера', type: TaskDto, isArray: true })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => TaskDto)
  @IsArray()
  data: TaskDto[];
}

export { GetDiaryTasksQuery, GetDiaryTasksRes };
