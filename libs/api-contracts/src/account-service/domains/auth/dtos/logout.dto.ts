import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { RpcStatus } from '../../../../rpc';

class ReqData {
  @IsInt()
  userId: number;

  @IsOptional()
  @IsString()
  userAgent?: string;
}

class ResData {
  @Type(() => Number)
  @IsEnum(RpcStatus)
  @IsString()
  stats: number;
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
