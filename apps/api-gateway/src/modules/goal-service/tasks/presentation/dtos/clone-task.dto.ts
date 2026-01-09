import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInt, IsOptional, ValidateNested } from 'class-validator';
import { TaskDto } from './task.dto';

class CloneTaskReqData {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  groupId?: number;
}

class CloneTaskReq {
  @ApiProperty({
    description: 'Запрос сервера',
    type: CloneTaskReqData,
    required: false,
  })
  @ValidateNested()
  @IsOptional()
  @Type(() => CloneTaskReqData)
  data?: CloneTaskReqData;
}

class CloneTaskRes {
  @ApiProperty({ description: 'Ответ сервера' })
  @Expose()
  @ValidateNested()
  @Type(() => TaskDto)
  data: TaskDto;
}

export { CloneTaskReq, CloneTaskRes };
