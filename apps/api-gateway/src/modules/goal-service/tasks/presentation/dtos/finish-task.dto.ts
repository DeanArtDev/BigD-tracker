import { TaskFinishStatus } from '@big-d/api-contracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';

class FinishTaskReqData {
  @ApiPropertyOptional({
    example: 'Не получилось',
    description: 'Описание причины просрочки или отказа',
  })
  @Expose()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    example: TaskFinishStatus.COMPLETED,
    description: 'Тип завершения дела',
    enum: TaskFinishStatus,
  })
  @Expose()
  @IsEnum(TaskFinishStatus)
  type: TaskFinishStatus;
}

class FinishTaskRes {
  @ApiProperty({ description: 'Ответ сервера' })
  @Expose()
  @IsBoolean()
  data: boolean;
}

class FinishTaskReq {
  @ApiProperty({
    description: 'Запрос сервера',
    type: FinishTaskReqData,
  })
  @ValidateNested()
  @Type(() => FinishTaskReqData)
  data: FinishTaskReqData;
}

export { FinishTaskRes, FinishTaskReq };
