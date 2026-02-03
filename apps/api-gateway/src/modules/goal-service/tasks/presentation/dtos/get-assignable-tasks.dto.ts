import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { TaskDto } from './task.dto';

class GetAssignableTasksQuery {
  @ApiProperty({
    example: 'Имя дела',
    description: 'Очень важное дело',
  })
  @Expose()
  @IsString()
  search: string;
}

class GetAssignableTasksRes {
  @ApiProperty({ description: 'Ответ сервера', type: TaskDto, isArray: true })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => TaskDto)
  @IsArray()
  data: TaskDto[];
}

export { GetAssignableTasksQuery, GetAssignableTasksRes };
