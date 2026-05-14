import { Type } from 'class-transformer';
import { IsInt, IsIP, IsJWT, IsOptional, IsString, ValidateNested } from 'class-validator';

class RefreshReqData {
  @IsInt()
  sessionId: number;

  @IsInt()
  userId: number;

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

class RefreshResData {
  @IsString()
  @IsJWT()
  accessToken: string;

  @IsInt()
  maxAge: number;
}

class RefreshRes {
  @ValidateNested()
  @Type(() => RefreshResData)
  data: RefreshResData;
}

class RefreshReq {
  @ValidateNested()
  @Type(() => RefreshReqData)
  data: RefreshReqData;
}

export { RefreshRes, RefreshReq };
