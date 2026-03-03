import { TaskRecurrencyDto } from './task-recurrency.dto';
import { TaskDto } from './task.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInt, IsISO8601, IsNumber, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';

class ReplaceTaskReqData {
  @ApiProperty({ example: 'Имя дела' })
  @Expose()
  @MaxLength(255)
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Описание дела' })
  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 2, description: 'От 1 до 4' })
  @Expose()
  @Min(1)
  @Max(4)
  @IsInt()
  priority: number;

  @ApiProperty({ example: 100, description: 'От 0 до 100' })
  @Expose()
  @Min(0)
  @Max(100)
  @IsNumber()
  weight: number;

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
    description: 'Паттерн повторения дела',
    type: TaskRecurrencyDto,
  })
  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => TaskRecurrencyDto)
  recurrence?: TaskRecurrencyDto;
}

class ReplaceTaskReq {
  @ApiProperty({
    description: 'Запрос сервера',
    type: ReplaceTaskReqData,
  })
  @ValidateNested()
  @Type(() => ReplaceTaskReqData)
  data: ReplaceTaskReqData;
}

class ReplaceTaskRes {
  @ApiProperty({ description: 'Ответ сервера' })
  @Expose()
  @ValidateNested()
  @Type(() => TaskDto)
  data: TaskDto;
}

export { ReplaceTaskReq, ReplaceTaskRes };
