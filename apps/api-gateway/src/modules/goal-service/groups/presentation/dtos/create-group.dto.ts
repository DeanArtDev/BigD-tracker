import { GroupResSingle } from './shared/group-response.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

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

class CreateGroupRes extends GroupResSingle {}

export { CreateGroupReq, CreateGroupRes };
