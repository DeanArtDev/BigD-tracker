import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
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

class RegisterReq {
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

  @IsInt()
  maxAge: number;
}

class RegisterRes {
  @ValidateNested()
  @Type(() => ResData)
  data: ResData;
}

export { RegisterReq, RegisterRes };
