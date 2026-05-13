import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { RpcStatus } from '../../../../rpc';

class ReqData {
  @IsInt()
  userId: number;

  @IsOptional()
  @IsString()
  ip?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}

class ResData {
  @IsEnum(RpcStatus)
  @Type(() => Number)
  status: RpcStatus;
}

class LogoutRes {
  @ValidateNested()
  @Type(() => ResData)
  data: ResData;
}

class LogoutReq {
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

export { LogoutReq, LogoutRes };
