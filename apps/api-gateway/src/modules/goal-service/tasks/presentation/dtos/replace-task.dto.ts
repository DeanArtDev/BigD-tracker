import { TaskDto } from './task.dto';
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

class ReplaceTaskReqData {
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

  @ApiProperty({ example: 100, description: 'От 0 до 100' })
  @Min(0)
  @Max(100)
  @IsInt()
  weight: number;

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

  @ApiPropertyOptional({
    example: '----',
    description: 'Паттерн повторения дела',
  })
  @Expose()
  @IsOptional()
  @IsString()
  recurrence?: string;
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
