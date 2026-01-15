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
import { TaskDto } from './task.dto';

class CreateTaskInINBOXReqData {
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

  @ApiPropertyOptional({ example: '2026-06-24T13:01:02.471Z' })
  @IsISO8601()
  @IsOptional()
  @IsString()
  deadline?: string;

  @ApiPropertyOptional({ example: 'Описание дела' })
  @IsOptional()
  @IsString()
  description?: string;
}

class CreateTaskInINBOXReq {
  @ApiProperty({
    description: 'Запрос сервера',
    type: CreateTaskInINBOXReqData,
  })
  @ValidateNested()
  @Type(() => CreateTaskInINBOXReqData)
  data: CreateTaskInINBOXReqData;
}

class CreateTaskInINBOXRes {
  @ApiProperty({ description: 'Ответ сервера' })
  @Expose()
  @ValidateNested()
  @Type(() => TaskDto)
  data: TaskDto;
}

export { CreateTaskInINBOXReq, CreateTaskInINBOXRes };
