import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto, PaginationResDto } from '@shared/dto';
import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { TaskDto } from './task.dto';

class GetDeletedTasksResData {
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

class GetDeletedTasksRes {
  @ApiProperty({ description: 'Ответ сервера', type: GetDeletedTasksResData })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => GetDeletedTasksResData)
  data: GetDeletedTasksResData;
}

class GetDeletedTasksQuery extends PaginationQueryDto {}

export { GetDeletedTasksRes, GetDeletedTasksQuery };
