import { Expose } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString } from 'class-validator';

class UserDto {
  @IsInt()
  @Expose()
  id: number;

  @IsString()
  @IsOptional()
  @Expose()
  screenName?: string;

  @IsEmail()
  @Expose()
  email: string;

  @Expose()
  @IsOptional()
  @IsString()
  avatar?: string;
}

export { UserDto };
