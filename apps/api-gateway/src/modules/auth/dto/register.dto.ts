import {
  IsEmail,
  IsInt,
  IsJWT,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class RegisterReqData {
  @ApiProperty({ example: 'email2@mail.com' })
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  login: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  @MinLength(6)
  @IsString()
  password: string;
}

class RegisterRequest {
  @ApiProperty({
    description: 'Данные для запроса',
    type: RegisterReqData,
  })
  @Expose()
  @ValidateNested()
  @Type(() => RegisterReqData)
  data: RegisterReqData;
}

class RegisterResData {
  @ApiProperty({ example: 'jwt token is here' })
  @Expose()
  @IsJWT()
  @IsString()
  token: string;
}

class RegisterRpcResData {
  @ApiProperty({ example: 'jwt token' })
  @Expose()
  @IsJWT()
  @IsString()
  accessToken: string;

  @ApiProperty({ example: 'Рефреш токен' })
  @Expose()
  @IsString()
  refreshToken: string;

  @ApiProperty({ example: 'Время жизни токена' })
  @Expose()
  @IsInt()
  maxAge: number;
}

class RegisterRpcRes {
  @Expose()
  @ValidateNested()
  @Type(() => RegisterRpcResData)
  data: RegisterRpcResData;
}

class RegisterResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: RegisterResData,
  })
  @Expose()
  @ValidateNested()
  @Type(() => RegisterResData)
  data: RegisterResData;
}

export { RegisterResponse, RegisterRpcRes, RegisterRequest };
