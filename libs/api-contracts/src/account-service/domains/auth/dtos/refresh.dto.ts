import { Type } from 'class-transformer';
import { IsInt, IsIP, IsJWT, IsOptional, IsString, ValidateNested } from 'class-validator';

class ReqData {
  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  @IsIP('4')
  ip?: string;

  @IsString()
  refreshToken: string;
}

class ResData {
  @IsString()
  @IsJWT()
  accessToken: string;

  @IsString()
  refreshToken: string;

  @IsInt()
  maxAge: number;
}

class RefreshRes {
  @ValidateNested()
  @Type(() => ResData)
  data: ResData;
}

class RefreshReq {
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

export { RefreshRes, RefreshReq };
