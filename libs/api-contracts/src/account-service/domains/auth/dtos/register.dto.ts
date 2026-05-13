import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsIP, IsJWT, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

class RegisterReqData {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  login: string;

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
  @Type(() => RegisterReqData)
  data: RegisterReqData;
}

class RegisterResData {
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
  @Type(() => RegisterResData)
  data: RegisterResData;
}

export { RegisterReq, RegisterRes };
