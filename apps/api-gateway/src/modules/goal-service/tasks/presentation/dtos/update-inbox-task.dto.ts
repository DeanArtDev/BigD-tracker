import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { IsAbsoluteDateTimeWithoutTimezone } from '@shared/validation';
import { buildTaskDateTimeApiProperty } from './task-date-time';
import { TaskDto } from './task.dto';

class UpdateInboxTaskReqData {
  @ApiProperty({ example: 'Имя дела' })
  @MaxLength(255)
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Описание дела' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 2, description: 'От 1 до 4' })
  @Min(1)
  @Max(4)
  @IsInt()
  priority: number;

  @ApiPropertyOptional(buildTaskDateTimeApiProperty())
  @Expose()
  @IsAbsoluteDateTimeWithoutTimezone()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional(buildTaskDateTimeApiProperty())
  @Expose()
  @IsAbsoluteDateTimeWithoutTimezone()
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
