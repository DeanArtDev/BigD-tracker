import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { GroupResSingle } from './shared/group-response.dto';

class ReplaceGroupTask {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  id: number;

  @ApiProperty({ example: 'Имя дела' })
  @Expose()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Описание' })
  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 2, description: 'От 1 до 4' })
  @Expose()
  @Min(1)
  @Max(4)
  @IsInt()
  priority: number;

  @ApiPropertyOptional({ example: '2025-05-24T13:01:02.471Z' })
  @Expose()
  @IsISO8601()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-05-24T13:01:02.471Z' })
  @Expose()
  @IsISO8601()
  @IsOptional()
  @IsString()
  deadline?: string;

  @ApiProperty({ example: 100, description: 'От 0 до 100' })
  @Expose()
  @Min(0)
  @Max(100)
  @IsInt()
  weight: number;
}

class ReplaceGroupReqData {
  @ApiProperty({ example: 'Название группы' })
  @Expose()
  @MaxLength(255)
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Описание' })
  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Список дел',
    type: ReplaceGroupTask,
    isArray: true,
  })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => ReplaceGroupTask)
  @IsArray()
  tasks: ReplaceGroupTask[];
}

class ReplaceGroupReq {
  @ApiProperty({
    description: 'Запрос сервера',
    type: ReplaceGroupReqData,
  })
  @Expose()
  @ValidateNested()
  @Type(() => ReplaceGroupReqData)
  data: ReplaceGroupReqData;
}

class ReplaceGroupRes extends GroupResSingle {}

export { ReplaceGroupReq, ReplaceGroupRes };
