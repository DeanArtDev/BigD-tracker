import { IsEmail, IsNotEmpty, IsString, MinLength, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class RegisterReqData {
  @ApiProperty({ example: 'example@example.com' })
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  login: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
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

class ResponseDto {
  @ApiProperty({ example: 'jwt token is here' })
  @IsString()
  token: string;
}

class RegisterResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: ResponseDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => ResponseDto)
  data: ResponseDto;
}

export { RegisterResponse, RegisterRequest };
