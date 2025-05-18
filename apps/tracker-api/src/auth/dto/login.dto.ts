import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class LoginRequest {
  @ApiProperty({ example: 'example@example.com' })
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  login: string;

  @ApiProperty({ example: '1234567' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

class LoginDto {
  @ApiProperty({ example: 'jwt token is here' })
  @IsString()
  token: string;
}

class LoginResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: LoginDto,
  })
  data: LoginDto;
}

export { LoginResponse, LoginDto, LoginRequest };
