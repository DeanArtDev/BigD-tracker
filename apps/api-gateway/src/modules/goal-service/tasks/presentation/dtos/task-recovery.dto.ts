import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';

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

class TaskRecoveryResData {
  @ApiProperty({ example: 123 })
  @Expose()
  @IsInt()
  id: number;
}

class TaskRecoveryRes {
  @ApiProperty({ description: 'Ответ сервера' })
  @Expose()
  @ValidateNested()
  @Type(() => TaskRecoveryResData)
  data: TaskRecoveryResData;
}

export { TaskRecoveryReq, TaskRecoveryRes };
