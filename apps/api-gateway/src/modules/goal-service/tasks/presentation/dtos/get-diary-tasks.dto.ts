import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsISO8601, ValidateNested } from 'class-validator';
import { TaskDto } from './task.dto';

class GetDiaryTasksQuery {
  @ApiProperty({
    example: '2026-05-24T13:01:02.471Z',
    description: 'ISO String',
  })
  @Expose()
  @IsISO8601()
  from: string;

  @ApiProperty({
    example: '2026-05-24T13:01:02.471Z',
    description: 'ISO String',
  })
  @Expose()
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
