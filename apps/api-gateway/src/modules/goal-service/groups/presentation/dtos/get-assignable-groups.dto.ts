import { GroupInfoDto } from './shared/group-info.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

class GetAssignableGroupsRes {
  @ApiProperty({
    description: 'Ответ сервера',
    type: GroupInfoDto,
    isArray: true,
  })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => GroupInfoDto)
  @IsArray()
  data: GroupInfoDto[];
}

export { GetAssignableGroupsRes };
