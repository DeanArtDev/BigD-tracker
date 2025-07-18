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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GroupResSingle } from '../shared';

class Thing {
  @ApiProperty({ example: 'Название дела' })
  @Expose()
  @MaxLength(255)
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Описание' })
  @Expose()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 2, description: 'От 1 до 4' })
  @Expose()
  @Min(1)
  @Max(4)
  @IsOptional()
  @IsInt()
  priority?: number;

  @ApiPropertyOptional({ example: '2025-05-24T13:01:02.471Z' })
  @Expose()
  @IsISO8601()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-05-24T13:01:02.471Z' })
  @Expose()
  @IsISO8601()
  @IsString()
  @IsOptional()
  deadline?: string;
}

class ReqData {
  @ApiProperty({ example: 'Название группы' })
  @Expose()
  @MaxLength(255)
  @IsString()
  name: string;

  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  goalId: number;

  @ApiPropertyOptional({ example: 'Описание' })
  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Список дел',
    type: Thing,
    isArray: true,
  })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => Thing)
  @IsArray()
  things: Thing[];
}

class CreateGroupReq {
  @ApiProperty({
    description: 'Запрос сервера',
    type: ReqData,
  })
  @Expose()
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class CreateGroupRes extends GroupResSingle {}

export { CreateGroupReq, CreateGroupRes };
