import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIP,
  IsJWT,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

class ReqData {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  login: string;

  @MinLength(6)
  @IsString()
  password: string;

  @IsIP('4')
  @IsOptional()
  @IsString()
  ip?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}

class LoginReq {
  @ValidateNested()
  @Type(() => ReqData)
  data: ReqData;
}

class ResData {
  @IsString()
  refreshToken: string;

  @IsString()
  @IsJWT()
  accessToken: string;
}

class LoginRes {
  @ValidateNested()
  @Type(() => ResData)
  data: ResData;
}

export { LoginReq, LoginRes };
