import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { UserDto } from './user.dto';

class UserResponse {
  @ApiProperty({
    description: 'Ответ сервера',
    type: UserDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserDto)
  data: UserDto[];
}

class UserResponseSingle {
  @ApiProperty({
    description: 'Ответ сервера',
    type: UserDto,
  })
  @ValidateNested()
  @Type(() => UserDto)
  data: UserDto;
}

export { UserResponse, UserResponseSingle };
