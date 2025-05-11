import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;
}

class CreateUserResponseDto {
  @ApiProperty({
    description: 'Созданный пользователь',
    type: CreateUserDto,
  })
  data: CreateUserDto;
}

export { CreateUserDto, CreateUserResponseDto };
