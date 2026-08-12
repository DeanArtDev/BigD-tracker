import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

class DeleteUserReqData {
  @IsInt()
  id: number;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  ip?: string;
}

class DeleteUserReq {
  @ValidateNested()
  @Type(() => DeleteUserReqData)
  data: DeleteUserReqData;
}

class DeleteUserResData {
  @IsInt()
  id: number;
}

class DeleteUserRes {
  @ValidateNested()
  @Type(() => DeleteUserResData)
  data: DeleteUserResData;
}

export { DeleteUserReq, DeleteUserRes };
