import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class RegisterRequest {
  @ApiProperty({ example: 'example@example.com' })
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  login: string;

  @ApiProperty({ example: '123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

class RegisterDto {
  @ApiProperty({ example: 'jwt token is here' })
  @IsString()
  token: string;
}

class RegisterResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: RegisterDto,
  })
  data: RegisterDto;
}

export { RegisterResponse, RegisterRequest };
