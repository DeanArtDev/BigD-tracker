import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEmail, IsJWT, IsNotEmpty, IsString, MinLength, ValidateNested } from 'class-validator';

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

export { RegisterResponse, RegisterRequest };
