import { IsEmail, IsNotEmpty, IsString, MinLength, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class RequestDto {
  @ApiProperty({ example: 'example@example.com' })
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  login: string;

  @ApiProperty({ example: '1234567A' })
  @IsNotEmpty()
  @MinLength(6)
  @IsString()
  password: string;
}

class LoginRequest {
  @ApiProperty({
    description: 'Данные для запроса',
    type: RequestDto,
  })
  @ValidateNested()
  @Type(() => RequestDto)
  data: RequestDto;
}

class ResponseDto {
  @ApiProperty({ example: 'jwt token is here' })
  @Expose()
  @IsString()
  token: string;
}

class LoginResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: ResponseDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => ResponseDto)
  data: ResponseDto;
}

export { LoginResponse, LoginRequest };
