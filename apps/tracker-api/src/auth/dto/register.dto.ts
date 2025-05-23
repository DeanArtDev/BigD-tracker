import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class RequestDto {
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
    type: RequestDto,
  })
  @ValidateNested()
  @Type(() => RequestDto)
  data: RequestDto;
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
  @ValidateNested()
  @Type(() => ResponseDto)
  data: ResponseDto;
}

export { RegisterResponse, RegisterRequest };
