import { GroupStatus } from '@big-d/api-contracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';

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
  @IsNumber()
  progress: number;

  @ApiProperty({
    example: GroupStatus.NOT_STARTED,
    description: 'Статус группы',
    enum: GroupStatus,
  })
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
  @ApiProperty({
    description: 'Ответ сервера',
    type: CreateGroupResData,
  })
  @Expose()
  @ValidateNested()
  @Type(() => CreateGroupResData)
  data: CreateGroupResData;
}

export { CreateGroupReq, CreateGroupRes };
