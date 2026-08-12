import { Type } from 'class-transformer';
import { IsInt, IsJWT, IsString, ValidateNested } from 'class-validator';

class ReferralTokenReqData {
  @IsInt()
  uid: number;

  @IsInt()
  sid: number;

  @IsInt()
  iat: number;

  @IsInt()
  exp: number;
}

class ReferralTokenReq {
  @ValidateNested()
  @Type(() => ReferralTokenReqData)
  data: ReferralTokenReqData;
}

class ReferralTokenResData {
  @IsJWT()
  @IsString()
  referralToken: string;
}

class ReferralTokenRes {
  @ValidateNested()
  @Type(() => ReferralTokenResData)
  data: ReferralTokenResData;
}

export { ReferralTokenReq, ReferralTokenRes };
