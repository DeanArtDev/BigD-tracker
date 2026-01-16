import { GroupDto } from './shared/group.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

class GetUserGroupsRes {
  @ApiProperty({
    description: 'Ответ сервера',
    type: GroupDto,
    isArray: true,
  })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => GroupDto)
  data: GroupDto[];
}

export { GetUserGroupsRes };
