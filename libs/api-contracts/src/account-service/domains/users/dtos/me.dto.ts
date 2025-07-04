import { Expose, Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';
import { UserDto } from './user.dto';

class ReqData {
  @Expose()
  @IsInt()
  id: number;
}

class MeReq {
  @Expose()
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class MeRes {
  @Expose()
  @ValidateNested()
  @Type(() => UserDto)
  data: UserDto;
}

export { MeReq, MeRes };
