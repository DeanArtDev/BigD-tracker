import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { GroupInBoxDto } from '../shared';

class GetInBoxRes {
  @ApiProperty({
    description: 'Ответ сервера',
    type: GroupInBoxDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => GroupInBoxDto)
  data: GroupInBoxDto;
}

export { GetInBoxRes };
