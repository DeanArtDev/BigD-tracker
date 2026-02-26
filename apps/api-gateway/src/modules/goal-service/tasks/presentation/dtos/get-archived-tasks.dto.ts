import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto, PaginationResDto } from '@shared/dto';
import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { TaskDto } from './task.dto';

class GetArchivedTasksResData {
  @ApiProperty({ description: 'Ответ сервера', type: TaskDto, isArray: true })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => TaskDto)
  @IsArray()
  items: TaskDto[];

  @ApiProperty({
    description: 'Метаинформация',
    type: PaginationResDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => PaginationResDto)
  meta: PaginationResDto;
}

class GetArchivedTasksRes {
  @ApiProperty({ description: 'Ответ сервера', type: GetArchivedTasksResData })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => GetArchivedTasksResData)
  data: GetArchivedTasksResData;
}

class GetArchivedTasksQuery extends PaginationQueryDto {}

export { GetArchivedTasksRes, GetArchivedTasksQuery };
