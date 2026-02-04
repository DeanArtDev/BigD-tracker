import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { GroupDetailedDto } from './shared/group-detailed.dto';

class GetDetailedGroupsRes {
  @ApiProperty({
    description: 'Ответ сервера',
    type: GroupDetailedDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => GroupDetailedDto)
  data: GroupDetailedDto;
}

export { GetDetailedGroupsRes };
