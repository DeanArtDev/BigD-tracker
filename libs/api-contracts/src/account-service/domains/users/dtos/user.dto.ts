import { Expose } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

class UserDto {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsOptional()
  @IsString()
  screenName?: string;

  @Expose()
  @IsEmail()
  @IsString()
  email: string;

  @Expose()
  @IsOptional()
  @IsUrl()
  @IsString()
  avatar?: string;
}

export { UserDto };
