import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { GroupDto } from '../shared';

class GetMyGroupsRes {
  @ApiProperty({
    description: 'Ответ сервера',
    type: GroupDto,
    isArray: true,
  })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => GroupDto)
  @IsArray()
  data: GroupDto[];
}

export { GetMyGroupsRes };
