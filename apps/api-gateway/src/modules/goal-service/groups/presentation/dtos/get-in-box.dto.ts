import { TaskDto } from '@/modules/goal-service/tasks';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

class GetInBoxRes {
  @ApiProperty({
    description: 'Ответ сервера',
    type: TaskDto,
    isArray: true,
  })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => TaskDto)
  data: TaskDto[];
}

export { GetInBoxRes };
