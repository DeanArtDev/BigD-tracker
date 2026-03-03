import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInt, IsISO8601, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { TaskRecurrencyDto } from './task-recurrency.dto';
import { TaskDto } from './task.dto';

class CreateTaskReqData {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  groupId?: number;

  @ApiProperty({ example: 'Имя дела' })
  @MaxLength(255)
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 2, description: 'От 1 до 4' })
  @IsOptional()
  @Min(1)
  @Max(4)
  @IsInt()
  priority?: number;

  @ApiPropertyOptional({ example: 100, description: 'От 0 до 100' })
  @IsOptional()
  @Min(0)
  @Max(100)
  @IsInt()
  weight?: number;

  @ApiPropertyOptional({ example: 'Описание дела' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: '2025-06-24T13:01:02.471Z',
  })
  @Expose()
  @IsISO8601()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-05-24T13:01:02.471Z',
  })
  @Expose()
  @IsISO8601()
  @IsOptional()
  @IsString()
  deadline?: string;

  @ApiPropertyOptional({
    type: TaskRecurrencyDto,
    description: 'Паттерн повторения дела',
  })
  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => TaskRecurrencyDto)
  recurrence?: TaskRecurrencyDto;
}

class CreateTaskReq {
  @ApiProperty({
    description: 'Запрос сервера',
    type: CreateTaskReqData,
  })
  @ValidateNested()
  @Type(() => CreateTaskReqData)
  data: CreateTaskReqData;
}

class CreateTaskRes {
  @ApiProperty({ description: 'Ответ сервера' })
  @Expose()
  @ValidateNested()
  @Type(() => TaskDto)
  data: TaskDto;
}

export { CreateTaskReq, CreateTaskRes };
