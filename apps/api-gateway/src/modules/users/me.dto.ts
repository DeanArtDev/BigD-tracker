import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';

class UserDto {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  id: number;

  @ApiPropertyOptional({ example: 'Крутой ник' })
  @Expose()
  @IsOptional()
  @IsString()
  screenName?: string;

  @ApiProperty({ example: 'test@email.com' })
  @Expose()
  @IsEmail()
  @IsString()
  email: string;

  @ApiPropertyOptional({ example: '/some-url.png' })
  @Expose()
  @IsOptional()
  @IsUrl()
  @IsString()
  avatar?: string;
}

class MeRes {
  @ApiProperty({ description: 'Ответ сервера', type: UserDto })
  @Expose()
  @ValidateNested()
  @Type(() => UserDto)
  data: UserDto;
}

export { UserDto, MeRes };
