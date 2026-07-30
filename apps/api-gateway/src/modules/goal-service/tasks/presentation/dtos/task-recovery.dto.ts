import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';
import { TaskDto } from './task.dto';

class TaskRecoveryReqData {
  @ApiProperty({ example: 1 })
  @IsInt()
  groupId: number;
}

class TaskRecoveryReq {
  @ApiProperty({
    description: 'Запрос сервера',
    type: TaskRecoveryReqData,
  })
  @ValidateNested()
  @Type(() => TaskRecoveryReqData)
  data: TaskRecoveryReqData;
}

class TaskRecoveryRes {
  @ApiProperty({ description: 'Ответ сервера' })
  @Expose()
  @ValidateNested()
  @Type(() => TaskDto)
  data: TaskDto;
}

export { TaskRecoveryReq, TaskRecoveryRes };
