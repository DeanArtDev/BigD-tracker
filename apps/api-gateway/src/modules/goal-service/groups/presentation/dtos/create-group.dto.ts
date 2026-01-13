import { GroupStatus } from '@big-d/api-contracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

class CreateGroupReqData {
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
}

class CreateGroupResData {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  id: number;

  @ApiProperty({ example: 'Группа дел' })
  @Expose()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Описание' })
  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  userId: number;

  @ApiProperty({ example: 40, description: 'От 0 до 100' })
  @Expose()
  @Min(0)
  @Max(100)
  @IsInt()
  progress: number;

  @ApiProperty({ example: 100, description: 'От 0 до 100' })
  @Expose()
  @Min(0)
  @Max(100)
  @IsInt()
  weight: number;

  @ApiProperty({ example: 40, description: 'От 0 до 100', enum: GroupStatus })
  @Expose()
  @IsEnum(GroupStatus)
  @Type(() => String)
  status: GroupStatus;
}

class CreateGroupReq {
  @ApiProperty({
    description: 'Запрос сервера',
    type: CreateGroupReqData,
  })
  @Expose()
  @ValidateNested()
  @Type(() => CreateGroupReqData)
  data: CreateGroupReqData;
}

class CreateGroupRes {
  @Expose()
  @ValidateNested()
  @Type(() => CreateGroupResData)
  data: CreateGroupResData;
}

export { CreateGroupReq, CreateGroupRes };
