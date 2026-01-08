import { TaskDto } from '@/modules/goal-service/tasks';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

class UpdateInboxTaskReqData {
  @ApiProperty({ example: 'Имя дела' })
  @MaxLength(255)
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Описание дела' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 2, description: 'От 1 до 4' })
  @Min(1)
  @Max(4)
  @IsInt()
  priority: number;

  @ApiPropertyOptional({ example: '2025-06-24T13:01:02.471Z' })
  @IsISO8601()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-05-24T13:01:02.471Z' })
  @IsISO8601()
  @IsOptional()
  @IsString()
  deadline?: string;
}

class UpdateInboxTaskReq {
  @ApiProperty({
    description: 'Запрос сервера',
    type: UpdateInboxTaskReqData,
  })
  @ValidateNested()
  @Type(() => UpdateInboxTaskReqData)
  data: UpdateInboxTaskReqData;
}

class UpdateInboxTaskRes {
  @ApiProperty({ description: 'Ответ сервера' })
  @Expose()
  @ValidateNested()
  @Type(() => TaskDto)
  data: TaskDto;
}

export { UpdateInboxTaskReq, UpdateInboxTaskRes };
