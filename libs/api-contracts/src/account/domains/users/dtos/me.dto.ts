import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';
import { UserDto } from './user.dto';

class ReqData {
  @IsInt()
  @Expose()
  id: number;
}

class MeReq {
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class MeRes {
  @ApiProperty({
    description: 'Ответ сервера',
    type: UserDto,
  })
  @ValidateNested()
  @Type(() => UserDto)
  data: UserDto;
}

export { MeReq, MeRes };
