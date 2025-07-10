import { Expose, Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';

class ReqData {
  @Expose()
  @IsInt()
  id: number;
}

class DeleteUserReq {
  @Expose()
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class ResData {
  @Expose()
  @IsInt()
  id: number;
}

class DeleteUserRes {
  @Expose()
  @ValidateNested()
  @Type(() => ResData)
  data: ResData;
}

export { DeleteUserReq, DeleteUserRes };
